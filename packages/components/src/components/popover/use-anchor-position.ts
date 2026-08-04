import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

// 浮层相对锚点的展开方位：主轴方向（top/bottom/left/right）+ 交叉轴对齐（start/end）。
// start/end 指与锚点的起始边 / 结束边对齐：bottom-start 即浮层在锚点下方、左边缘对齐。
export type FloatingPlacement =
  'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'right-start';

// 主轴方向与交叉轴对齐方式
type FloatingSide = 'top' | 'bottom' | 'left' | 'right';
type FloatingAlign = 'start' | 'end';

export interface UseAnchorPositionOptions {
  // 锚点元素：浮层以其 getBoundingClientRect() 为定位基准；为 null 时不计算（保持隐藏）
  readonly anchor: HTMLElement | null;
  // 期望展开方位。主轴方向溢出视口时自动翻转（bottom ↔ top、left ↔ right）；
  // 翻转后仍溢出则交给 clamp 兜底，保证浮层始终完整可见
  readonly placement?: FloatingPlacement;
  // 主轴间距：浮层与锚点之间的距离（px）
  readonly offset?: number;
  // 交叉轴微调（px）：对齐后再沿交叉轴平移，用于子菜单首项与触发器同高等精细对齐
  readonly crossOffset?: number;
  // 与视口边缘保留的安全距离（px），flip / clamp 都不会让浮层突破这个距离
  readonly viewportMargin?: number;
}

export interface UseAnchorPositionResult {
  // 挂到浮层根元素上的 ref：定位计算需要读取其实际渲染尺寸
  readonly floatingRef: RefObject<HTMLDivElement | null>;
  // 计算完成前为 visibility: hidden，避免浮层「先闪现在左上角再跳到位」
  readonly style: CSSProperties;
}

// 首次渲染占位样式：钉在左上角但不可见，等 useLayoutEffect 量出尺寸后一次性就位
const HIDDEN_STYLE: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  visibility: 'hidden',
};

// 主轴方向的反方向映射，用于溢出时翻转
const OPPOSITE_SIDE: Record<FloatingSide, FloatingSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function parsePlacement(placement: FloatingPlacement): {
  align: FloatingAlign;
  side: FloatingSide;
} {
  const [side, align] = placement.split('-') as [FloatingSide, FloatingAlign];
  return { side, align };
}

// 计算浮层左上角坐标（fixed 定位，坐标系为视口）。
// 步骤：按期望 side 落位 → 主轴溢出则尝试翻转 → 两轴 clamp 到视口安全距离内。
function computeFloatingPosition(
  anchorRect: DOMRect,
  floatingWidth: number,
  floatingHeight: number,
  placement: FloatingPlacement,
  offset: number,
  crossOffset: number,
  viewportMargin: number,
): { left: number; top: number } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const { side, align } = parsePlacement(placement);

  // 判断按某个 side 落位是否会在主轴方向溢出视口安全区
  const overflowsOn = (candidate: FloatingSide): boolean => {
    switch (candidate) {
      case 'bottom':
        return anchorRect.bottom + offset + floatingHeight > viewportHeight - viewportMargin;
      case 'top':
        return anchorRect.top - offset - floatingHeight < viewportMargin;
      case 'right':
        return anchorRect.right + offset + floatingWidth > viewportWidth - viewportMargin;
      case 'left':
        return anchorRect.left - offset - floatingWidth < viewportMargin;
    }
  };

  // 溢出时尝试翻转；仅当翻转后不溢出才采纳——两头都溢出（锚点过大或浮层过高）时
  // 保持原方向交给 clamp，避免在两个方向之间来回跳
  let resolvedSide = side;
  if (overflowsOn(side)) {
    const flipped = OPPOSITE_SIDE[side];
    if (!overflowsOn(flipped)) {
      resolvedSide = flipped;
    }
  }

  // 主轴定位
  let top = 0;
  let left = 0;
  switch (resolvedSide) {
    case 'bottom':
      top = anchorRect.bottom + offset;
      break;
    case 'top':
      top = anchorRect.top - offset - floatingHeight;
      break;
    case 'right':
      left = anchorRect.right + offset;
      break;
    case 'left':
      left = anchorRect.left - offset - floatingWidth;
      break;
  }

  // 交叉轴对齐：上下展开时水平对齐，左右展开时垂直对齐
  if (resolvedSide === 'top' || resolvedSide === 'bottom') {
    left = align === 'start' ? anchorRect.left : anchorRect.right - floatingWidth;
    left += crossOffset;
  } else {
    top = align === 'start' ? anchorRect.top : anchorRect.bottom - floatingHeight;
    top += crossOffset;
  }

  // 视口 clamp：两个方向都保证与边缘至少 viewportMargin 距离。
  // 浮层比视口还大时 Math.max(margin, vw - w - margin) 退化为 margin，钉在安全距离处。
  left = Math.min(
    Math.max(left, viewportMargin),
    Math.max(viewportMargin, viewportWidth - floatingWidth - viewportMargin),
  );
  top = Math.min(
    Math.max(top, viewportMargin),
    Math.max(viewportMargin, viewportHeight - floatingHeight - viewportMargin),
  );

  return { left, top };
}

// 锚点定位 hook：把浮层（fixed 定位、通常经 Portal 渲染到 body）贴在锚点旁，
// 自动处理视口边缘躲避（flip + clamp），并在滚动 / 缩放 / 尺寸变化时跟随。
export function useAnchorPosition({
  anchor,
  placement = 'bottom-start',
  offset = 6,
  crossOffset = 0,
  viewportMargin = 8,
}: UseAnchorPositionOptions): UseAnchorPositionResult {
  const floatingRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>(HIDDEN_STYLE);

  useLayoutEffect(() => {
    if (anchor === null) {
      return;
    }

    const update = () => {
      const floating = floatingRef.current;
      if (floating === null) {
        return;
      }
      const anchorRect = anchor.getBoundingClientRect();
      // 用 offsetWidth/Height 而非 floating.getBoundingClientRect()：
      // 首次渲染时元素带 visibility: hidden，尺寸依然可量，且不受未来 transform 影响
      const { left, top } = computeFloatingPosition(
        anchorRect,
        floating.offsetWidth,
        floating.offsetHeight,
        placement,
        offset,
        crossOffset,
        viewportMargin,
      );
      setStyle({ position: 'fixed', left, top });
    };

    update();

    // 跟随页面变化：窗口缩放、任意滚动容器滚动（capture 捕获嵌套滚动）、
    // 锚点或浮层自身尺寸变化（内容异步加载、字号变化等）
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            update();
          });
    observer?.observe(anchor);
    if (floatingRef.current !== null) {
      observer?.observe(floatingRef.current);
    }

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      observer?.disconnect();
    };
  }, [anchor, placement, offset, crossOffset, viewportMargin]);

  return { floatingRef, style };
}
