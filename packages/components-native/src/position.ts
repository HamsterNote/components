export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export type Placement = 'top' | 'bottom' | 'left' | 'right';
export function placePanel(
  anchor: Rect | null,
  panel: { width: number; height: number },
  bounds: Rect,
  placement: Placement,
  offset: number,
) {
  let x = bounds.x + (bounds.width - panel.width) / 2;
  let y = bounds.y + (bounds.height - panel.height) / 2;
  if (anchor) {
    x = anchor.x + (anchor.width - panel.width) / 2;
    y = anchor.y + (anchor.height - panel.height) / 2;
    if (placement === 'bottom' || placement === 'top') {
      const below = anchor.y + anchor.height + offset;
      const above = anchor.y - panel.height - offset;
      const fitsBelow = below + panel.height <= bounds.y + bounds.height;
      const fitsAbove = above >= bounds.y;
      y =
        placement === 'bottom'
          ? fitsBelow || !fitsAbove
            ? below
            : above
          : fitsAbove || !fitsBelow
            ? above
            : below;
    } else {
      const right = anchor.x + anchor.width + offset;
      const left = anchor.x - panel.width - offset;
      const fitsRight = right + panel.width <= bounds.x + bounds.width;
      const fitsLeft = left >= bounds.x;
      x =
        placement === 'right'
          ? fitsRight || !fitsLeft
            ? right
            : left
          : fitsLeft || !fitsRight
            ? left
            : right;
    }
  }
  return {
    left: Math.max(bounds.x, Math.min(x, bounds.x + bounds.width - panel.width)),
    top: Math.max(bounds.y, Math.min(y, bounds.y + bounds.height - panel.height)),
  };
}
