import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import {
  type FloatingPlacement,
  useAnchorPosition,
} from '../popover/use-anchor-position';

// 菜单项的语义色调：default 为常规文字色，danger 用于删除/移除等破坏性操作
export type MenuItemTone = 'default' | 'danger';

// 锚定模式下的展开方位（复用 useAnchorPosition 的定义并对外暴露，与 Popover 同范式）
export type MenuPlacement = FloatingPlacement;

export interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  // 菜单固定为垂直列表（ARIA menu 模式即垂直列表），不做 orientation prop
  readonly children: ReactNode;
  // 传入 anchor 后进入锚定模式：菜单通过 Portal 渲染到 document.body 下，
  // .hn-menu 直接作为浮层表面（自动叠加 .hn-menu--floating），不再外套 Popover。
  // 以锚点为基准做 fixed 定位，溢出视口时自动翻转并 clamp 到安全距离内
  readonly anchor?: HTMLElement | null;
  // 期望展开方位，仅锚定模式生效；默认 bottom-start（锚点下方、左对齐）
  readonly placement?: MenuPlacement;
  // 菜单与锚点的间距（px），仅锚定模式生效
  readonly anchorOffset?: number;
  // 交叉轴微调（px），仅锚定模式生效；用于子菜单首项与触发器同高等精细对齐
  readonly anchorCrossOffset?: number;
  // 菜单与视口边缘保留的安全距离（px），仅锚定模式生效
  readonly viewportMargin?: number;
  // React 19：ref 作为普通 prop 直接透传到菜单根 div，
  // 使用方常需要它做外部点击关闭等判断
  readonly ref?: Ref<HTMLDivElement>;
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: ReactNode;
  // 语义色调：danger 会渲染为 --hn-color-danger，用于破坏性操作
  readonly tone?: MenuItemTone;
  // 右侧快捷键提示，任意 ReactNode（字符串、kbd 组合皆可），不参与点击语义
  readonly shortcut?: ReactNode;
}

// hr 隐含 role="separator"（与 PopoverSeparator 一致，不显式写 role）；
// 排除 children 避免 TypeScript 把 hr 当作可放子节点的元素
export type MenuSeparatorProps = Omit<HTMLAttributes<HTMLHRElement>, 'children'>;

export interface MenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  // 分组小标签（如「文件」「编辑」），纯视觉分组，不承担交互语义
  readonly children: ReactNode;
}

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
}

// 语义菜单容器：垂直列表，role="menu" 表示一组 menuitem。
// 颜色一律使用全局 token 名，嵌入 Popover 时会自动继承其主题覆盖的局部变量。
// 传入 anchor 后进入锚定模式（与 Popover 锚定模式同一套机制）：菜单经 Portal 渲染到
// body 下并自动叠加 .hn-menu--floating 浮动表面——因 Portal 脱离父级级联，
// 浮动表面自带边框 / 阴影与 dark token 覆盖（data-theme="light" 可切浅色），
// 因此 .hn-menu 直接作为浮层外层，无需再套一层 Popover。
export function Menu({
  children,
  className,
  anchor = null,
  placement = 'bottom-start',
  anchorOffset = 6,
  anchorCrossOffset = 0,
  viewportMargin = 8,
  ref,
  style,
  ...props
}: MenuProps) {
  // 锚定模式：anchor 非空时菜单脱离使用方 DOM 树，经 Portal 渲染到 body 下
  const anchored = anchor !== null;
  // 定位 hook 始终调用以遵守 hooks 规则；非锚定模式传 null anchor，不产生任何计算与监听
  const { floatingRef, style: anchorStyle } = useAnchorPosition({
    anchor,
    placement,
    offset: anchorOffset,
    crossOffset: anchorCrossOffset,
    viewportMargin,
  });

  const classes = ['hn-menu', anchored ? 'hn-menu--floating' : undefined, className]
    .filter(Boolean)
    .join(' ');
  // 锚定模式：默认定位样式在前、使用方 style 在后，使用方可覆盖位置但不被默认值反向覆盖；
  // 非锚定模式不注入任何定位样式（与 Popover 非 edge/anchor 时行为一致）
  const mergedStyle: CSSProperties | undefined = anchored ? { ...anchorStyle, ...style } : style;

  // 合并定位 hook 的测量 ref 与使用方传入的 ref，两者都需要拿到菜单根元素
  const setRefs = (element: HTMLDivElement | null) => {
    floatingRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref !== undefined && ref !== null) {
      ref.current = element;
    }
  };

  const menu = (
    <div {...props} className={classes} ref={setRefs} role="menu" style={mergedStyle}>
      {children}
    </div>
  );

  // 锚定模式渲染到 body 下：避免被祖先的 overflow / transform / z-index 上下文裁剪或压住。
  // typeof document 守卫保证 SSR 场景直接退化为内联渲染（hydration 后由客户端接管）。
  if (anchored && typeof document !== 'undefined') {
    return createPortal(menu, document.body);
  }
  return menu;
}

// 菜单项：button + role="menuitem"。
// 默认 type="button"（与 Button 一致，避免在 form 内意外提交）。
// shortcut 存在时用 justify-content: space-between 把快捷键推到右侧。
export function MenuItem({
  children,
  className,
  shortcut,
  tone = 'default',
  type = 'button',
  ...props
}: MenuItemProps) {
  const classes = ['hn-menu__item', `hn-menu__item--${tone}`, className].filter(Boolean).join(' ');

  return (
    <button {...props} className={classes} role="menuitem" type={type}>
      <span className="hn-menu__item-label">{children}</span>
      {shortcut !== undefined && shortcut !== null && shortcut !== '' ? (
        <span className="hn-menu__shortcut">{shortcut}</span>
      ) : null}
    </button>
  );
}

// 分组分隔线：hr 自带 role="separator"，与 PopoverSeparator 行为一致。
// 在 Popover 内继承 --hn-popover-separator；独立使用时退到全局 --hn-color-border。
export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  const classes = ['hn-menu__separator', className].filter(Boolean).join(' ');

  return <hr {...props} className={classes} />;
}

// 分组小标签：纯视觉分组用，不承担交互语义，也不进入 menuitem 序列。
export function MenuLabel({ children, className, ...props }: MenuLabelProps) {
  const classes = ['hn-menu__label', className].filter(Boolean).join(' ');

  return (
    <div {...props} className={classes}>
      {children}
    </div>
  );
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
  'aria-label': ariaLabel,
  ...props
}: MenuSubmenuProps) {
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
    const firstItem = panel.querySelector<HTMLElement>('[role="menuitem"]');
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
        clearTimer();
        setOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  const handlePanelClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const selectedItem = event.target.closest<HTMLElement>('[role="menuitem"]');
    if (
      selectedItem === null ||
      selectedItem.getAttribute('aria-haspopup') === 'menu'
    ) {
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
        {/* 右侧 chevron：用 ▸ 字符与库的极简风格一致（无图标依赖），
            颜色走 --hn-color-text-muted 与 shortcut 同档，开合时旋转表达状态。 */}
        <span aria-hidden="true" className="hn-menu__submenu-chevron">
          ▸
        </span>
      </button>
      {open ? (
        // panel 即一层锚定模式的 Menu：向 trigger 右侧展开，anchorOffset 2 是与 trigger
        // 之间的缝隙；anchorCrossOffset -6 抵消浮动菜单的 border(1px) + padding(5px)，
        // 让 panel 内第一个 menuitem 与 trigger 在视觉上同高对齐。
        <Menu
          anchor={triggerEl}
          anchorCrossOffset={-6}
          anchorOffset={2}
          // aria-label 挂在 role="menu" 上：menu 角色支持命名，子菜单由此获得无障碍名。
          aria-label={nestedAriaLabel}
          className="hn-menu__submenu-panel"
          // capture 阶段先关闭子菜单，再执行子项自身的 onClick。这样即使子项会同步更新
          // 受控数据并触发父组件重渲染，关闭状态也不会因 Portal 事件冒泡时机而丢失。
          onClickCapture={handlePanelClickCapture}
          onKeyDown={handlePanelKeyDown}
          placement="right-start"
          ref={panelRef}
          // 子菜单面板需要可被聚焦（focusFirstMenuItem 把焦点送进来），
          // tabindex=-1 让 div 可编程聚焦但不进入 Tab 序列，符合 ARIA APG 子菜单模式。
          tabIndex={-1}
        >
          {children}
        </Menu>
      ) : null}
    </div>
  );
}
