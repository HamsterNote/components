import baseline from '../../fixtures/web-0.3.0-icon-geometry.json';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Icon, ICON_NAMES } from '../index';
import { ICON_GEOMETRY } from '../shared/icons';
import { placePanel } from '../../packages/components-native/src/position';
describe('共享图标与原生定位边界', () => {
  it('全部名称/图元属性与 0.3.0 JSX 基线完全一致', () => {
    const names = Object.keys(baseline);
    for (const name of names) {
      const expected = baseline[name as keyof typeof baseline];
      expect(ICON_GEOMETRY[name as keyof typeof ICON_GEOMETRY]).toEqual(expected);
      const { container, unmount } = render(<Icon name={name as (typeof ICON_NAMES)[number]} />);
      expect(container.querySelector('svg')?.children.length).toBe(expected.length + 1);
      unmount();
    }
    expect(names).toEqual([...ICON_NAMES]);
    expect(names).toHaveLength(65);
  });
  it('优先翻转，安全区和键盘缩小后 clamp，无遮点居中', () => {
    const bounds = { x: 12, y: 40, width: 366, height: 300 };
    expect(
      placePanel(
        { x: 200, y: 300, width: 44, height: 30 },
        { width: 200, height: 120 },
        bounds,
        'bottom',
        8,
      ),
    ).toEqual({ left: 122, top: 172 });
    expect(placePanel(null, { width: 200, height: 120 }, bounds, 'bottom', 8)).toEqual({
      left: 95,
      top: 130,
    });
    expect(
      placePanel(
        { x: 370, y: 0, width: 10, height: 10 },
        { width: 300, height: 300 },
        bounds,
        'right',
        8,
      ),
    ).toEqual({ left: 62, top: 40 });
  });
});
