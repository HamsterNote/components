import { describe, expect, it } from 'vitest';

import { computeFloatingPosition, type FloatingPlacement } from './use-anchor-position';

const PLACEMENTS = [
  'top-start',
  'top',
  'top-end',
  'bottom-start',
  'bottom',
  'bottom-end',
  'left-start',
  'left',
  'left-end',
  'right-start',
  'right',
  'right-end',
] as const satisfies readonly FloatingPlacement[];

const EXPECTED_POSITIONS: Record<
  FloatingPlacement,
  { readonly left: number; readonly top: number }
> = {
  'top-start': { left: 203, top: 130 },
  top: { left: 213, top: 130 },
  'top-end': { left: 223, top: 130 },
  'bottom-start': { left: 203, top: 260 },
  bottom: { left: 213, top: 260 },
  'bottom-end': { left: 223, top: 260 },
  'left-start': { left: 110, top: 203 },
  left: { left: 110, top: 198 },
  'left-end': { left: 110, top: 193 },
  'right-start': { left: 310, top: 203 },
  right: { left: 310, top: 198 },
  'right-end': { left: 310, top: 193 },
};

function position(
  anchorRect: DOMRect,
  placement: FloatingPlacement,
  viewportWidth = 1_000,
  viewportHeight = 800,
) {
  return computeFloatingPosition({
    anchorRect,
    crossOffset: 3,
    floatingHeight: 60,
    floatingWidth: 80,
    offset: 10,
    placement,
    viewportHeight,
    viewportMargin: 8,
    viewportWidth,
  });
}

describe('共享锚点定位', () => {
  it.each(PLACEMENTS)(
    'Given 充足空间, When 使用 %s, Then 按对应主方向和物理对齐定位',
    (placement) => {
      const anchorRect = new DOMRect(200, 200, 100, 50);

      expect(position(anchorRect, placement)).toEqual(EXPECTED_POSITIONS[placement]);
    },
  );

  it.each(PLACEMENTS)(
    'Given %s 的期望方向空间不足, When 反方向空间充足, Then 仅翻转主方向并保留对齐',
    (placement) => {
      const side = placement.startsWith('top')
        ? 'top'
        : placement.startsWith('bottom')
          ? 'bottom'
          : placement.startsWith('left')
            ? 'left'
            : 'right';
      const anchorRect =
        side === 'top'
          ? new DOMRect(200, 5, 100, 50)
          : side === 'bottom'
            ? new DOMRect(200, 745, 100, 50)
            : side === 'left'
              ? new DOMRect(5, 200, 100, 50)
              : new DOMRect(895, 200, 100, 50);

      const result = position(anchorRect, placement);

      switch (side) {
        case 'top':
          expect(result.top).toBe(anchorRect.bottom + 10);
          break;
        case 'bottom':
          expect(result.top).toBe(anchorRect.top - 10 - 60);
          break;
        case 'left':
          expect(result.left).toBe(anchorRect.right + 10);
          break;
        case 'right':
          expect(result.left).toBe(anchorRect.left - 10 - 80);
          break;
        default:
          throw new Error(`Unexpected placement side: ${String(side)}`);
      }
    },
  );

  it.each(PLACEMENTS)(
    'Given %s 两侧空间都不足, When 计算位置, Then 最终坐标 clamp 到视口边界',
    (placement) => {
      const result = computeFloatingPosition({
        anchorRect: new DOMRect(35, 35, 30, 30),
        crossOffset: -200,
        floatingHeight: 80,
        floatingWidth: 80,
        offset: 10,
        placement,
        viewportHeight: 100,
        viewportMargin: 8,
        viewportWidth: 100,
      });

      expect(result.left).toBeGreaterThanOrEqual(8);
      expect(result.left).toBeLessThanOrEqual(12);
      expect(result.top).toBeGreaterThanOrEqual(8);
      expect(result.top).toBeLessThanOrEqual(12);
    },
  );
});
