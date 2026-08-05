import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from 'react';

import { isTopmostModal, registerModal, subscribeModalStack } from './modal-stack';

// 模态浮层（Dialog / Drawer 共用）的可见状态机。
// - 'closed'：未挂载
// - 'entering'：刚打开，正在播放入场动画
// - 'open'：入场动画结束，稳定展示
// - 'leaving'：使用方把 open 置为 false，正在播放退场动画，结束后真正卸载
type ModalPhase = 'closed' | 'entering' | 'open' | 'leaving';

// 焦点收集：过滤掉 disabled / hidden / 非可聚焦的元素。
// selector 已通过 :not([disabled]) / :not([type="hidden"]) 在选择器层排除大部分，
// 这里再做一道 aria-hidden / hidden 属性的兜底过滤。
function isFocusable(element: HTMLElement): boolean {
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  if (element.hasAttribute('hidden')) {
    return false;
  }
  return true;
}

// 在容器内查找所有可聚焦元素，按 DOM 顺序返回。
// 选择器覆盖常见可聚焦元素（a/button/input/textarea/select + 任意 tabindex），
// tabindex="-1" 也纳入（可编程聚焦但不入 Tab 序列，焦点回环时仍需要它）。
function collectFocusable(container: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]';
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(selector));
  return candidates.filter((element) => isFocusable(element));
}

export interface UseModalOptions {
  // 受控开合状态：完全由使用方控制，hook 不维护 open 状态本身，只维护动画阶段
  readonly open: boolean;
  // 关闭回调：Esc / 背景点击等内部触发关闭时调用，由使用方决定是否真正 setOpen(false)
  readonly onClose: () => void;
  // 是否允许 Esc 关闭（默认 true）
  readonly closeOnEsc?: boolean;
  // 是否允许点击背景关闭（默认 true）
  readonly closeOnBackdrop?: boolean;
  // 退场动画时长（ms）：leaving 阶段持续该时长后真正卸载
  readonly exitDuration?: number;
  // 原触发器在关闭过程中被移除时使用的稳定回焦目标
  readonly finalFocusRef?: RefObject<HTMLElement | null>;
}

export interface UseModalResult {
  // 当前状态机阶段：Dialog/Drawer 据此决定是否渲染 + 应用 enter/exit 动画类
  readonly phase: ModalPhase;
  // 是否处于已挂载状态（任何非 closed 阶段都需要挂载 DOM）
  readonly mounted: boolean;
  // 用于绑定 data-state 让 CSS 应用对应动画：entering/open → 'enter'，leaving → 'exit'
  readonly dataState: 'enter' | 'exit' | undefined;
  // 挂到面板根元素上的 ref：焦点管理与 Tab 循环都依赖它
  readonly panelRef: RefObject<HTMLDivElement | null>;
  // 挂到背景遮罩元素上的 ref：背景点击关闭需要判断点击目标
  readonly backdropRef: RefObject<HTMLDivElement | null>;
  // 供 title / description 使用的稳定 id（useId），用于 aria-labelledby / aria-describedby
  readonly titleId: string;
  readonly descriptionId: string;
  // 面板 keydown 处理：Esc 关闭 + Tab/Shift+Tab 焦点循环
  readonly handlePanelKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  // 背景点击处理：点击背景（而非面板内容）时触发关闭
  readonly handleBackdropPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  readonly topmost: boolean;
}

// 模态浮层共享行为 hook：Dialog 与 Drawer 共用同一套焦点管理 / 滚动锁 / Esc / 背景点击 / 动画状态机。
//
// 设计要点：
// - 受控：open 与 onClose 都由使用方提供，hook 不维护 open 本身，只维护动画阶段
// - 动画：使用 data-state 属性让 CSS 在 enter/exit 之间切换动画，phase 状态机决定何时卸载
// - 焦点：打开时把焦点送进面板（优先第一个可聚焦元素，否则面板自身 tabIndex=-1 接住），
//         关闭时把焦点还给打开前最后一个聚焦元素
// - Tab 循环：Shift+Tab 在第一个焦点上回环到最后一个，Tab 在最后一个上回环到第一个
// - 滚动锁：打开时保存 body.overflow 并置为 hidden，关闭时恢复
export function useModal({
  open,
  onClose,
  closeOnEsc = true,
  closeOnBackdrop = true,
  exitDuration = 180,
  finalFocusRef,
}: UseModalOptions): UseModalResult {
  // 内部 phase 状态：仅承载动画结束的两步转换（entering → open、leaving → closed）。
  // open → entering / leaving 的转换在渲染期由派生 phase 完成（见下方派生逻辑）。
  const [internalPhase, setInternalPhase] = useState<ModalPhase>('closed');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  // 打开前最后一个聚焦元素：关闭时回焦。用 RefObject 保持稳定引用，避免闭包陈旧
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  // 保存 body.overflow 原值用于恢复；用字符串即可，未设置时为空字符串
  const savedBodyOverflowRef = useRef<string>('');
  // 滚动锁是否处于激活状态。不能靠 savedBodyOverflowRef.current !== '' 判断：
  // body 原始 overflow 通常就是空字符串，空字符串同样是合法的待恢复值，
  // 否则组件直接卸载（未走 closed 相位）时兜底恢复会被跳过，body 永久锁死
  const scrollLockedRef = useRef(false);
  // useId 生成稳定的 title/description id，用于 aria-labelledby / aria-describedby
  const titleId = useId();
  const descriptionId = useId();
  const modalIdRef = useRef(Symbol('modal'));
  const topmost = useSyncExternalStore(
    subscribeModalStack,
    () => isTopmostModal(modalIdRef.current),
    () => false,
  );

  // 受控 open 驱动的相位派生：
  // 把 internalPhase 当作「上一帧 phase」，根据 open 派生本帧对外暴露的 phase。
  //   - open=true & 上一帧 closed/leaving → entering（开始播入场动画）
  //   - open=true & 上一帧 entering/open → 保持（动画进行中或已稳定）
  //   - open=false & 上一帧 entering/open → leaving（开始播退场动画）
  //   - open=false & 上一帧 closed/leaving → 保持（已卸载或在退场中）
  // 在渲染期用 useMemo 派生，避免在 effect 里 setState 触发级联渲染（react-hooks/set-state-in-effect）。
  const phase = useMemo<ModalPhase>(() => {
    if (open) {
      if (internalPhase === 'closed' || internalPhase === 'leaving') {
        return 'entering';
      }
      return internalPhase;
    }
    if (internalPhase === 'entering' || internalPhase === 'open') {
      return 'leaving';
    }
    return internalPhase;
  }, [open, internalPhase]);
  const mounted = phase !== 'closed';

  // 入场动画结束：entering → open。用 setTimeout 标记动画完成（与 transform 动画时长一致）；
  // 不用 transitionend 是因为多属性动画会触发多次 transitionend，统一计时器更可靠。
  // 这是真正需要 effect 的副作用（定时器），setState 在 setTimeout 回调中、不在 effect 体内同步执行。
  useEffect(() => {
    if (phase !== 'entering') {
      return undefined;
    }
    const timer = setTimeout(() => {
      setInternalPhase('open');
    }, 180);
    return () => {
      clearTimeout(timer);
    };
  }, [phase]);

  // 退场动画结束：leaving → closed。等待 exitDuration 后真正卸载。
  useEffect(() => {
    if (phase !== 'leaving') {
      return undefined;
    }
    const timer = setTimeout(() => {
      setInternalPhase('closed');
    }, exitDuration);
    return () => {
      clearTimeout(timer);
    };
  }, [phase, exitDuration]);

  useLayoutEffect(() => {
    if (!mounted) {
      return undefined;
    }
    return registerModal(modalIdRef.current);
  }, [mounted]);

  // 打开时：保存当前焦点、把焦点送进面板、锁滚动。关闭时：恢复焦点与滚动。
  // 依赖 phase 而非 open：只在 entering（真正开始展示）时抢焦点与锁滚动，
  // 在 closed（真正卸载）时回焦与解锁，避免在 leaving 动画中途就回焦显得突兀。
  useEffect(() => {
    if (phase !== 'entering' && phase !== 'closed') {
      return undefined;
    }
    if (phase === 'entering') {
      // 保存打开前的焦点元素，关闭时回焦
      const active = document.activeElement;
      if (active instanceof HTMLElement) {
        previouslyFocusedRef.current = active;
      }
      // 锁滚动：保存原 overflow，置为 hidden；已锁定时不重复保存，避免覆盖原始值
      if (!scrollLockedRef.current) {
        savedBodyOverflowRef.current = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        scrollLockedRef.current = true;
      }
      // 把焦点送进面板：优先第一个可聚焦元素，否则面板自身（tabIndex=-1 由组件挂上）。
      // 用 requestAnimationFrame 等待 React commit + 浏览器布局完成。
      const frame = requestAnimationFrame(() => {
        const panel = panelRef.current;
        if (panel === null) {
          return;
        }
        const focusables = collectFocusable(panel);
        if (focusables.length > 0) {
          focusables[0]?.focus();
        } else {
          panel.focus();
        }
      });
      return () => {
        cancelAnimationFrame(frame);
      };
    }
    // phase === 'closed'：真正卸载后回焦 + 解锁滚动
    const previous = previouslyFocusedRef.current;
    const focusTarget =
      previous !== null && document.contains(previous) ? previous : finalFocusRef?.current;
    const frame = requestAnimationFrame(() => {
      if (focusTarget !== undefined && focusTarget !== null && document.contains(focusTarget)) {
        focusTarget.focus();
      }
    });
    previouslyFocusedRef.current = null;
    // 仅在确实持有锁时恢复，避免初始挂载（phase='closed'）时误清使用方已有的 body overflow
    if (scrollLockedRef.current) {
      document.body.style.overflow = savedBodyOverflowRef.current;
      savedBodyOverflowRef.current = '';
      scrollLockedRef.current = false;
    }
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [phase, finalFocusRef]);

  // 组件卸载时兜底解锁滚动，防止异常卸载后 body 被永久锁住
  useEffect(() => {
    return () => {
      if (scrollLockedRef.current) {
        document.body.style.overflow = savedBodyOverflowRef.current;
        savedBodyOverflowRef.current = '';
        scrollLockedRef.current = false;
      }
    };
  }, []);

  // 通过 ref 镜像最新的 closeOnEsc / closeOnBackdrop / onClose，让下方事件处理函数保持稳定引用，
  // 避免每次渲染都生成新函数导致 JSX 上 onKeyDown / onPointerDown 抖动。
  const closeOnEscRef = useRef(closeOnEsc);
  const closeOnBackdropRef = useRef(closeOnBackdrop);
  const onCloseRef = useRef(onClose);
  const topmostRef = useRef(topmost);
  useLayoutEffect(() => {
    closeOnEscRef.current = closeOnEsc;
    closeOnBackdropRef.current = closeOnBackdrop;
    onCloseRef.current = onClose;
    topmostRef.current = topmost;
  });

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!topmostRef.current) {
      return;
    }
    if (closeOnEscRef.current && event.key === 'Escape') {
      // 阻止 Esc 触发上层（如全屏退出）默认行为，专注于关闭浮层
      event.preventDefault();
      onCloseRef.current();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const panel = panelRef.current;
    if (panel === null) {
      return;
    }
    const focusables = collectFocusable(panel);
    if (focusables.length === 0) {
      // 没有可聚焦元素：Tab 让面板自身接住（tabIndex=-1 不在序列中，需要 preventDefault）
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (first === undefined || last === undefined) {
      return;
    }
    const activeElement = document.activeElement;
    if (event.shiftKey) {
      // Shift+Tab：在第一个元素上回环到最后一个
      if (activeElement === first || activeElement === panel || !panel.contains(activeElement)) {
        event.preventDefault();
        last.focus();
      }
    } else {
      // Tab：在最后一个元素上回环到第一个
      if (activeElement === last || !panel.contains(activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  // 背景点击关闭：仅当点击落在背景遮罩自身（而非冒泡自面板）时触发
  const handleBackdropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!topmostRef.current || !closeOnBackdropRef.current) {
      return;
    }
    if (event.target !== backdropRef.current) {
      return;
    }
    onCloseRef.current();
  };

  const dataState: 'enter' | 'exit' | undefined =
    phase === 'leaving' ? 'exit' : phase === 'entering' || phase === 'open' ? 'enter' : undefined;

  return {
    phase,
    mounted,
    dataState,
    panelRef,
    backdropRef,
    titleId,
    descriptionId,
    handlePanelKeyDown,
    handleBackdropPointerDown,
    topmost,
  };
}
