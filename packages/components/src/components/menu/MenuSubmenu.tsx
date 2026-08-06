import {
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { MenuSurface } from './MenuSurface';
import { type MenuPlacement, MenuTreeContext } from './menu-tree-context';

export interface MenuSubmenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  // 触发器文本：任意 ReactNode（字符串、带图标的 span 等）
  readonly label: ReactNode;
  // 子菜单内容：MenuItem / MenuSeparator / MenuLabel 等菜单节点
  readonly children: ReactNode;
  // label 为非字符串时无法自动派生 aria-label，此时使用方可显式传入覆盖；
  // label 为字符串时该 prop 优先级仍高于 label，便于「移动到…」等带省略号场景自定义更清晰的语义名
  readonly 'aria-label'?: string;
  // 与 MenuItem 一致的禁用语义：禁用时阻止 hover/click/键盘展开
  readonly disabled?: boolean;
  readonly panelTheme?: 'light' | 'dark';
  // 仅覆盖当前子菜单面板，不改变后代子菜单的根级默认值
  readonly placement?: MenuPlacement;
  readonly offset?: number;
  readonly viewportMargin?: number;
}

// 悬停展开的延迟（毫秒）。
// 开启稍快（150ms）以让连续移动到相邻 submenu 时手感跟手；
// 关闭稍慢（200ms）以容忍鼠标在 trigger 与 panel 之间的短暂「缝隙」移动，避免误关。
const SUBMENU_OPEN_DELAY = 150;
const SUBMENU_CLOSE_DELAY = 200;

// 子菜单：trigger 是一个 menuitem 触发器（含右侧 chevron），panel 就是一层锚定模式的
// Menu——.hn-menu 直接作为浮层表面（自动叠加 .hn-menu--floating，自带边框 / 阴影与
// dark token 覆盖），不再外套 Popover。panel 经 Portal 渲染到 body 下，默认向 trigger
// 右侧展开，右侧溢出视口时自动向左翻转，垂直方向 clamp 在安全距离内。
// React 事件会穿透 Portal 沿组件树传播，因此 wrapper 的 pointer enter/leave 判定
// 在 panel 移出 DOM 树后依然成立，鼠标在 trigger 与 panel 之间移动不会误关。
//
// 已知限制（与库哲学一致，不在此实现）：
//   - 不实现完整的 roving-tabindex 箭头导航——现有 Menu 也没有，保持范围一致。
export function MenuSubmenu({
  label,
  children,
  className,
  disabled = false,
  offset,
  panelTheme,
  placement,
  viewportMargin,
  'aria-label': ariaLabel,
  ...props
}: MenuSubmenuProps) {
  const menuTreeConfig = useContext(MenuTreeContext);
  const panelPlacement = placement ?? menuTreeConfig.submenuPlacement;
  const panelOffset = offset ?? menuTreeConfig.submenuOffset;
  const panelViewportMargin = viewportMargin ?? menuTreeConfig.submenuViewportMargin;
  const panelAlign = panelPlacement.endsWith('-start')
    ? 'start'
    : panelPlacement.endsWith('-end')
      ? 'end'
      : 'center';
  const panelCrossOffset = panelAlign === 'start' ? -6 : panelAlign === 'end' ? 6 : 0;
  const panelSide = panelPlacement.split('-')[0];
  const chevron =
    panelSide === 'left' ? '◂' : panelSide === 'top' ? '▴' : panelSide === 'bottom' ? '▾' : '▸';
  const [open, setOpen] = useState(false);
  // 延迟计时器引用：开启与关闭都用 setTimeout 实现「跟手 + 防误关」的折中。
  // 用 ReturnType<typeof setTimeout> 兼容浏览器与 Node 类型，避免引入额外类型。
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 触发器按钮引用：键盘「左箭头/Esc 关闭后回焦」需要它，同时作为 panel 的定位锚点。
  const triggerRef = useRef<HTMLButtonElement>(null);
  // 触发器元素的 state 镜像：Menu 的 anchor 需要在渲染期读取，
  // ref.current 不允许在渲染期访问（react-hooks/refs），因此用 callback ref 同步进 state。
  const [triggerEl, setTriggerEl] = useState<HTMLButtonElement | null>(null);
  // 面板容器引用：键盘「右箭头/Enter 进入子菜单」后需要把焦点放到第一个 menuitem。
  const panelRef = useRef<HTMLDivElement>(null);

  // 统一清理待执行的计时器：每次 schedule 前、组件卸载时调用，避免重复触发与内存泄漏。
  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // 安排一次带延迟的状态变更，先清掉旧的待执行任务再设新的，
  // 保证连续 hover 移动只以最后一次为准。
  const schedule = (nextOpen: boolean, delay: number) => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setOpen(nextOpen);
      timerRef.current = null;
    }, delay);
  };

  // 组件卸载时务必清掉挂起的计时器，否则会在 unmount 后仍触发 setState（React 19 下虽不再
  // 警告，但属于不规范行为，且会延后于其他组件的渲染时机）。
  // 计时器清理逻辑内联在 cleanup 里，不依赖组件作用域里的 clearTimer 引用，
  // 让 hook 自包含、dep 数组稳定为空——timerRef 本身是 stable 的，无需列入依赖。
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // 打开子菜单：disabled 时直接拒绝，所有调用点（hover/click/键盘）都走这一道闸门。
  const openSubmenu = () => {
    if (disabled) {
      return;
    }
    schedule(true, SUBMENU_OPEN_DELAY);
  };

  // 关闭子菜单：同样经过 disabled 检查（虽然 disabled 一般不会处于 open 状态，
  // 但保留检查让状态机单一来源、行为可预测）。
  const closeSubmenu = () => {
    schedule(false, SUBMENU_CLOSE_DELAY);
  };

  // 点击触发器切换开合：触屏设备没有 hover，click 是其唯一入口；
  // 桌面端点击同样允许切换，使键盘与鼠标用户都能用同一种「点一下」的语义。
  const handleTriggerClick = () => {
    if (disabled) {
      return;
    }
    clearTimer();
    setOpen((current) => !current);
  };

  // 把焦点移到面板内第一个可聚焦 menuitem；找不到时回退到面板本身，
  // 保证「右箭头/Enter 进入子菜单」后键盘用户一定有落点。
  const focusFirstMenuItem = () => {
    const panel = panelRef.current;
    if (panel === null) {
      return;
    }
    const firstItem = panel.querySelector<HTMLElement>(
      '[role="menuitem"]:not([disabled]):not([aria-disabled="true"])',
    );
    if (firstItem !== null) {
      firstItem.focus();
    } else {
      // 面板没有可聚焦项时让面板自身接住焦点（面板容器本身 tabindex=-1）。
      panel.focus();
    }
  };

  // 触发器键盘事件：右箭头 / Enter / Space 进入子菜单。
  // 不阻止 Enter/Space 的默认行为之外的事——button 默认会触发 click，
  // 这里在 keyDown 阶段先一步把焦点送进去，避免点击 toggle 把刚打开的又关上。
  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    switch (event.key) {
      case 'ArrowRight':
      case 'Enter':
      case ' ':
        // 阻止 click 回调把 open 翻回 false，也阻止空格的滚动默认行为。
        event.preventDefault();
        clearTimer();
        setOpen(true);
        // 状态更新是异步的，下一帧再去找 panel 内的 menuitem。
        // 用 requestAnimationFrame 等待 React commit + 浏览器布局完成。
        requestAnimationFrame(() => {
          focusFirstMenuItem();
        });
        break;
    }
  };

  // 面板键盘事件：左箭头 / Esc 关闭子菜单并把焦点还给触发器，
  // 形成「右进、左出」的子菜单键盘往返闭环（与原生菜单行为一致）。
  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowLeft':
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        clearTimer();
        setOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  const handlePanelClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const selectedItem = event.target.closest<HTMLElement>('[role="menuitem"]');
    if (selectedItem === null || selectedItem.getAttribute('aria-haspopup') === 'menu') {
      return;
    }
    clearTimer();
    setOpen(false);
    triggerRef.current?.focus();
  };

  // 计算 nested Menu 的 aria-label：
  // 1) 使用方显式传入 aria-label 优先级最高，覆盖一切；
  // 2) 否则若 label 是字符串，直接用其作为无障碍名（含「…」等标点也保留，与可见文本一致）；
  // 3) label 为非字符串（带图标等）时退到 undefined，由使用方按需补充 aria-label。
  const nestedAriaLabel = ariaLabel ?? (typeof label === 'string' ? label : undefined);

  const wrapperClasses = [
    'hn-menu__submenu',
    open ? 'hn-menu__submenu--open' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // 合并焦点管理用的 triggerRef 与定位锚点用的 state 镜像
  const setTriggerRefs = (element: HTMLButtonElement | null) => {
    triggerRef.current = element;
    setTriggerEl(element);
  };

  return (
    <div
      {...props}
      className={wrapperClasses}
      // 悬停展开：进入 wrapper 即开始计时打开，离开即开始计时关闭。
      // 用 wrapper 而非 trigger 是为了让 trigger 与 panel 之间的缝隙也算「仍在子菜单区域内」，
      // 否则鼠标从 trigger 移到 panel 的瞬间会触发 close 计时导致误关。
      // panel 虽经 Portal 渲染到 body 下，React 的 enter/leave 合成仍沿组件树判定，
      // 因此移到 panel 上不会触发 wrapper 的 pointerleave。
      onPointerEnter={disabled ? undefined : openSubmenu}
      onPointerLeave={disabled ? undefined : closeSubmenu}
    >
      <button
        aria-label={nestedAriaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        className="hn-menu__item hn-menu__submenu-trigger"
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        ref={setTriggerRefs}
        role="menuitem"
        type="button"
      >
        <span className="hn-menu__item-label">{label}</span>
        <span aria-hidden="true" className="hn-menu__submenu-chevron">
          {chevron}
        </span>
      </button>
      {open ? (
        // panel 即一层锚定模式的 Menu：向 trigger 右侧展开，anchorOffset 2 是与 trigger
        // 之间的缝隙；anchorCrossOffset -6 抵消浮动菜单的 border(1px) + padding(5px)，
        // 让 panel 内第一个 menuitem 与 trigger 在视觉上同高对齐。
        <MenuSurface
          anchor={triggerEl}
          anchorCrossOffset={panelCrossOffset}
          anchorOffset={panelOffset}
          // aria-label 挂在 role="menu" 上：menu 角色支持命名，子菜单由此获得无障碍名。
          aria-label={nestedAriaLabel}
          className="hn-menu__submenu-panel"
          data-theme={panelTheme}
          onClick={handlePanelClick}
          onKeyDown={handlePanelKeyDown}
          placement={panelPlacement}
          ref={panelRef}
          // 子菜单面板需要可被聚焦（focusFirstMenuItem 把焦点送进来），
          // tabindex=-1 让 div 可编程聚焦但不进入 Tab 序列，符合 ARIA APG 子菜单模式。
          tabIndex={-1}
          viewportMargin={panelViewportMargin}
        >
          {children}
        </MenuSurface>
      ) : null}
    </div>
  );
}
