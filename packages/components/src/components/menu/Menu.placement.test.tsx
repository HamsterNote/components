import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UseAnchorPositionOptions } from '../popover/use-anchor-position';
import { Menu, MenuItem, MenuSubmenu } from './Menu';

const anchorPositionCalls = vi.hoisted(() => [] as UseAnchorPositionOptions[]);

vi.mock('../popover/use-anchor-position', () => {
  return {
    useAnchorPosition: (options: UseAnchorPositionOptions) => {
      anchorPositionCalls.push(options);
      return { floatingRef: { current: null }, style: {} };
    },
  };
});

function latestAnchoredCall(): UseAnchorPositionOptions {
  for (let index = anchorPositionCalls.length - 1; index >= 0; index -= 1) {
    const call = anchorPositionCalls[index];
    if (call !== undefined && call.anchor !== null) {
      return call;
    }
  }
  throw new Error('Expected an anchored submenu positioning call');
}

describe('Menu 子菜单定位配置', () => {
  beforeEach(() => {
    anchorPositionCalls.length = 0;
  });

  it('Given 未传新属性, When 展开子菜单, Then 保持原有方向、间距、边距和箭头', () => {
    render(
      <Menu>
        <MenuSubmenu label="更多">
          <MenuItem>详情</MenuItem>
        </MenuSubmenu>
      </Menu>,
    );

    const trigger = screen.getByRole('menuitem', { name: '更多' });
    expect(trigger).toHaveTextContent('▸');
    fireEvent.click(trigger);

    expect(latestAnchoredCall()).toMatchObject({
      placement: 'right-start',
      offset: 2,
      crossOffset: -6,
      viewportMargin: 8,
    });
  });

  it('Given 根 Menu 声明子菜单默认值, When 展开子菜单, Then 使用根级配置和内容区对齐补偿', () => {
    render(
      <Menu submenuOffset={-4} submenuPlacement="left-end" submenuViewportMargin={-5}>
        <MenuSubmenu label="更多">
          <MenuItem>详情</MenuItem>
        </MenuSubmenu>
      </Menu>,
    );

    const trigger = screen.getByRole('menuitem', { name: '更多' });
    expect(trigger).toHaveTextContent('◂');
    fireEvent.click(trigger);

    expect(latestAnchoredCall()).toMatchObject({
      placement: 'left-end',
      offset: -4,
      crossOffset: 6,
      viewportMargin: -5,
    });
  });

  it('Given MenuSubmenu 局部覆盖, When 展开当前面板, Then 只对当前面板应用覆盖', () => {
    render(
      <Menu submenuOffset={2} submenuPlacement="bottom-end" submenuViewportMargin={8}>
        <MenuSubmenu label="一级" offset={7} placement="left-start" viewportMargin={4}>
          <MenuSubmenu label="二级">
            <MenuItem>详情</MenuItem>
          </MenuSubmenu>
        </MenuSubmenu>
      </Menu>,
    );

    const firstTrigger = screen.getByRole('menuitem', { name: '一级' });
    expect(firstTrigger).toHaveTextContent('◂');
    fireEvent.click(firstTrigger);
    expect(latestAnchoredCall()).toMatchObject({
      placement: 'left-start',
      offset: 7,
      crossOffset: -6,
      viewportMargin: 4,
    });

    const secondTrigger = screen.getByRole('menuitem', { name: '二级' });
    expect(secondTrigger).toHaveTextContent('▾');
    fireEvent.click(secondTrigger);
    expect(latestAnchoredCall()).toMatchObject({
      placement: 'bottom-end',
      offset: 2,
      crossOffset: 6,
      viewportMargin: 8,
    });
  });

  it('Given 子菜单面板内显式嵌套 Menu, When 展开其子菜单, Then 开启新的默认配置树', () => {
    render(
      <Menu submenuPlacement="left-start">
        <MenuSubmenu label="外层">
          <Menu submenuPlacement="top">
            <MenuSubmenu label="内层">
              <MenuItem>详情</MenuItem>
            </MenuSubmenu>
          </Menu>
        </MenuSubmenu>
      </Menu>,
    );

    fireEvent.click(screen.getByRole('menuitem', { name: '外层' }));
    const innerTrigger = screen.getByRole('menuitem', { name: '内层' });
    expect(innerTrigger).toHaveTextContent('▴');
    fireEvent.click(innerTrigger);

    expect(latestAnchoredCall()).toMatchObject({
      placement: 'top',
      offset: 2,
      crossOffset: 0,
      viewportMargin: 8,
    });
  });

  it('Given 两层子菜单均已展开, When 在内层按左箭头, Then 只关闭内层并聚焦直接父级触发器', () => {
    render(
      <Menu>
        <MenuSubmenu label="外层">
          <MenuSubmenu label="内层">
            <MenuItem>详情</MenuItem>
          </MenuSubmenu>
        </MenuSubmenu>
      </Menu>,
    );

    const outerTrigger = screen.getByRole('menuitem', { name: '外层' });
    fireEvent.click(outerTrigger);
    const innerTrigger = screen.getByRole('menuitem', { name: '内层' });
    fireEvent.click(innerTrigger);

    fireEvent.keyDown(screen.getByRole('menuitem', { name: '详情' }), { key: 'ArrowLeft' });

    expect(screen.queryByRole('menuitem', { name: '详情' })).not.toBeInTheDocument();
    expect(innerTrigger).toHaveFocus();
    expect(outerTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(innerTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('Given 子菜单首项禁用, When 用右箭头进入, Then 聚焦第一个可用菜单项', async () => {
    render(
      <Menu>
        <MenuSubmenu label="更多">
          <MenuItem disabled>不可用</MenuItem>
          <MenuItem>可用项</MenuItem>
        </MenuSubmenu>
      </Menu>,
    );

    fireEvent.keyDown(screen.getByRole('menuitem', { name: '更多' }), { key: 'ArrowRight' });

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: '可用项' })).toHaveFocus();
    });
  });
});
