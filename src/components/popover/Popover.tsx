import {
  createContext,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';

import { useAnchorPosition, type FloatingPlacement } from './use-anchor-position';

export type PopoverTheme = 'dark' | 'light';
// 浮层排列方向：horizontal 为默认横排，vertical 为竖排（常用于侧边工具条）
export type PopoverOrientation = 'horizontal' | 'vertical';
// 独立贴边使用时贴靠的屏幕边缘
export type PopoverEdge = 'top' | 'bottom' | 'left' | 'right';
// 锚定模式下的展开方位（复用 useAnchorPosition 的定义并对外暴露）
export type PopoverPlacement = FloatingPlacement;

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly theme?: PopoverTheme;
  readonly orientation?: PopoverOrientation;
  // 传入 edge 后浮层以 position: fixed 贴在视口对应边缘，脱离使用方定位体系
  readonly edge?: PopoverEdge;
  // 浮层与屏幕边缘的距离（px），仅 edge 生效时使用
  readonly edgeOffset?: number;
  // 传入 anchor 后进入锚定模式：浮层通过 Portal 渲染到 document.body 下，
  // 以锚点为基准做 fixed 定位，溢出视口时自动翻转并 clamp 到安全距离内。
  // anchor 优先于 edge（两者同时使用时不应出现，anchor 语义更具体）
  readonly anchor?: HTMLElement | null;
  // 期望展开方位，仅锚定模式生效；默认 bottom-start（锚点下方、左对齐）
  readonly placement?: PopoverPlacement;
  // 浮层与锚点的间距（px），仅锚定模式生效
  readonly anchorOffset?: number;
  // 浮层与视口边缘保留的安全距离（px），仅锚定模式生效
  readonly viewportMargin?: number;
  // React 19：ref 作为普通 prop 直接透传到浮层根 div，
  // 使用方常需要它做外部点击关闭等判断
  readonly ref?: Ref<HTMLDivElement>;
}

export type PopoverSeparatorProps = Omit<
  HTMLAttributes<HTMLHRElement>,
  'aria-orientation' | 'children' | 'role'
>;

// 用内部 Context 把外层 Popover 的排列方向传给 PopoverSeparator，
// 让分隔线的无障碍语义随浮层方向自适应：横排浮层 → 竖直分隔线；竖排浮层 → 水平分隔线。
// 不导出：这是组件内部协作细节，不属于公开 API。
const PopoverOrientationContext = createContext<PopoverOrientation | null>(null);

// 根据外层浮层方向推导分隔线的 aria-orientation：
// 横排浮层里的分隔线是竖直的（vertical），竖排浮层里的分隔线是水平的（horizontal）。
function resolveSeparatorOrientation(
  orientation: PopoverOrientation | null,
): 'vertical' | 'horizontal' {
  return orientation === 'vertical' ? 'horizontal' : 'vertical';
}

// 计算独立贴边模式下需要内联应用的定位样式。
// 仅当传入 edge 时返回非空对象，避免在默认用法下注入任何定位样式而改变现有行为。
function resolveEdgeStyle(edge: PopoverEdge | undefined, edgeOffset: number): CSSProperties {
  if (edge === undefined) {
    return {};
  }
  // top/bottom 贴边时水平居中（left: 50% + translateX(-50%)），
  // left/right 贴边时垂直居中（top: 50% + translateY(-50%)）。
  // 注意：transform 用于居中合并，若使用方通过 style 传入自定义 transform，需自行负责覆盖。
  switch (edge) {
    case 'top':
      return {
        position: 'fixed',
        top: edgeOffset,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    case 'bottom':
      return {
        position: 'fixed',
        bottom: edgeOffset,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    case 'left':
      return {
        position: 'fixed',
        left: edgeOffset,
        top: '50%',
        transform: 'translateY(-50%)',
      };
    case 'right':
      return {
        position: 'fixed',
        right: edgeOffset,
        top: '50%',
        transform: 'translateY(-50%)',
      };
  }
}

export function Popover({
  children,
  className,
  theme = 'dark',
  orientation = 'horizontal',
  edge,
  edgeOffset = 16,
  anchor = null,
  placement = 'bottom-start',
  anchorOffset = 6,
  viewportMargin = 8,
  ref,
  style,
  ...props
}: PopoverProps) {
  // 锚定模式：anchor 非空时浮层脱离使用方 DOM 树，经 Portal 渲染到 body 下
  const anchored = anchor !== null;
  // 定位 hook 始终调用以遵守 hooks 规则；非锚定模式传 null anchor，不产生任何计算与监听
  const { floatingRef, style: anchorStyle } = useAnchorPosition({
    anchor,
    placement,
    offset: anchorOffset,
    viewportMargin,
  });

  const classes = ['hn-popover', anchored ? 'hn-popover--floating' : undefined, className]
    .filter(Boolean)
    .join(' ');
  // 默认定位样式在前、使用方 style 在后，使使用方可以覆盖位置但不能被默认值反向覆盖。
  const mergedStyle: CSSProperties = anchored
    ? { ...anchorStyle, ...style }
    : { ...resolveEdgeStyle(edge, edgeOffset), ...style };

  // 合并定位 hook 的测量 ref 与使用方传入的 ref，两者都需要拿到浮层根元素
  const setRefs = (element: HTMLDivElement | null) => {
    floatingRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref !== undefined && ref !== null) {
      ref.current = element;
    }
  };

  const surface = (
    <PopoverOrientationContext.Provider value={orientation}>
      <div
        {...props}
        className={classes}
        data-theme={theme}
        data-orientation={orientation}
        ref={setRefs}
        style={mergedStyle}
      >
        {children}
      </div>
    </PopoverOrientationContext.Provider>
  );

  // 锚定模式渲染到 body 下：避免被祖先的 overflow / transform / z-index 上下文裁剪或压住。
  // typeof document 守卫保证 SSR 场景直接退化为不渲染（hydration 后由客户端接管）。
  if (anchored && typeof document !== 'undefined') {
    return createPortal(surface, document.body);
  }
  return surface;
}

export function PopoverSeparator({ className, ...props }: PopoverSeparatorProps) {
  const classes = ['hn-popover__separator', className].filter(Boolean).join(' ');
  // 从 Context 读取外层方向：有外层时随其翻转，没有外层（独立使用）时保持默认 vertical。
  const orientation = useContext(PopoverOrientationContext);

  return (
    <hr
      {...props}
      aria-orientation={resolveSeparatorOrientation(orientation)}
      className={classes}
    />
  );
}
