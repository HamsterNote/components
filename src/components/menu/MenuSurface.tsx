import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import { createPortal } from 'react-dom';

import { useAnchorPosition } from '../popover/use-anchor-position';
import type { MenuPlacement } from './menu-tree-context';

// 菜单浮层表面 props：即 Menu 的全部定位与透传属性，
// 子菜单 panel 复用同一表面（MenuSubmenu 渲染 MenuSurface 作为面板）。
export interface MenuSurfaceProps extends HTMLAttributes<HTMLDivElement> {
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

// 菜单浮层表面（Menu 与子菜单 panel 共用的渲染核心）：垂直列表，
// role="menu" 表示一组 menuitem。
// 颜色一律使用全局 token 名，嵌入 Popover 时会自动继承其主题覆盖的局部变量。
// 传入 anchor 后进入锚定模式（与 Popover 锚定模式同一套机制）：菜单经 Portal 渲染到
// body 下并自动叠加 .hn-menu--floating 浮动表面——因 Portal 脱离父级级联，
// 浮动表面自带边框 / 阴影与 dark token 覆盖（data-theme="light" 可切浅色），
// 因此 .hn-menu 直接作为浮层外层，无需再套一层 Popover。
export function MenuSurface({
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
}: MenuSurfaceProps) {
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
