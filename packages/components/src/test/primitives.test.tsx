import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  Badge,
  Button,
  ICON_NAMES,
  Icon,
  Kbd,
  Loading,
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuSubmenu,
} from '../index';

describe('基础组件契约', () => {
  it('Given 默认按钮, When 渲染, Then 保持默认类型、尺寸与视觉类名', () => {
    render(<Button className="consumer-class">保存</Button>);

    const button = screen.getByRole('button', { name: '保存' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass(
      'hn-button',
      'hn-button--secondary',
      'hn-button--medium',
      'consumer-class',
    );
    expect(button).not.toHaveClass('hn-button--ghost');
  });

  it('Given 危险幽灵小按钮, When 点击, Then 保留修饰类并触发消费方回调', () => {
    const onClick = vi.fn();
    render(
      <Button ghost onClick={onClick} size="small" variant="danger">
        删除
      </Button>,
    );

    const button = screen.getByRole('button', { name: '删除' });
    fireEvent.click(button);

    expect(button).toHaveClass('hn-button--danger', 'hn-button--ghost', 'hn-button--small');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('Given 带 tone 的徽标, When 渲染, Then 文本和状态类保持不变', () => {
    render(<Badge tone="success">已同步</Badge>);

    expect(screen.getByText('已同步')).toHaveClass('hn-badge', 'hn-badge--success');
  });

  it('Given 组合快捷键, When 渲染, Then 保留键帽顺序和隐藏的连接符', () => {
    const { container } = render(<Kbd keys={['⌘', 'K', 'K']}>被忽略</Kbd>);

    const keys = container.querySelectorAll('.hn-kbd__key');
    expect([...keys].map((key) => key.textContent)).toEqual(['⌘', 'K', 'K']);
    expect(container.querySelectorAll('.hn-kbd__plus')).toHaveLength(2);
    expect(container.querySelector('.hn-kbd__plus')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByText('被忽略')).not.toBeInTheDocument();
  });

  it('Given 带标签图标, When 渲染, Then 使用稳定 SVG 视觉属性和可访问名称', () => {
    render(<Icon className="consumer-icon" label="保存笔记" name="save" />);

    const icon = screen.getByRole('img', { name: '保存笔记' });
    expect(icon).toHaveClass('hn-icon', 'hn-icon--save', 'consumer-icon');
    expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    expect(icon).toHaveAttribute('stroke', 'currentColor');
    expect(icon).toHaveAttribute('width', '1em');
  });

  it('Given 无标签图标, When 渲染, Then 作为纯装饰从可访问树隐藏', () => {
    const { container } = render(<Icon name="close" />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('Given 评论图标, When 按公共名称渲染, Then API 与气泡轮廓可用', () => {
    render(<Icon label="评论" name="comment" />);

    expect(ICON_NAMES).toContain('comment');
    expect(screen.getByRole('img', { name: '评论' })).toHaveClass('hn-icon--comment');
  });

  it('Given 裁切图标, When 按公共名称渲染, Then API 与裁切角线轮廓可用', () => {
    render(<Icon label="裁切" name="crop" />);

    expect(ICON_NAMES).toContain('crop');
    expect(screen.getByRole('img', { name: '裁切' })).toHaveClass('hn-icon--crop');
  });

  it('Given 公共全屏图标, When 按名称渲染, Then API 与四角轮廓均可用', () => {
    render(
      <>
        <Icon label="全屏显示" name="fullscreen" />
        <Icon label="退出全屏" name="fullscreen-exit" />
      </>,
    );

    expect(ICON_NAMES).toContain('fullscreen');
    expect(ICON_NAMES).toContain('fullscreen-exit');
    expect(screen.getByRole('img', { name: '全屏显示' })).toHaveClass('hn-icon--fullscreen');
    expect(screen.getByRole('img', { name: '退出全屏' })).toHaveClass('hn-icon--fullscreen-exit');
  });

  it('Given 大尺寸覆盖式加载, When 渲染, Then 状态语义、文案和尺寸保持稳定', () => {
    const { container } = render(
      <Loading cover size="large" text="正在同步">
        被忽略
      </Loading>,
    );

    const status = screen.getByRole('status', { name: '正在同步' });
    expect(status).toHaveClass('hn-loading', 'hn-loading--large', 'hn-loading--cover');
    expect(status).toHaveTextContent('正在同步');
    expect(status).not.toHaveTextContent('被忽略');
    expect(container.querySelector('svg')).toHaveAttribute('width', '28');
  });

  it('Given 完整菜单, When 渲染并点击菜单项, Then 保留 ARIA 结构和危险色调', () => {
    const onDelete = vi.fn();
    render(
      <Menu aria-label="文件操作">
        <MenuLabel>文件</MenuLabel>
        <MenuItem shortcut="⌘N">新建</MenuItem>
        <MenuSeparator />
        <MenuItem onClick={onDelete} tone="danger">
          删除
        </MenuItem>
      </Menu>,
    );

    const menu = screen.getByRole('menu', { name: '文件操作' });
    const items = within(menu).getAllByRole('menuitem');
    const deleteItem = within(menu).getByRole('menuitem', { name: '删除' });
    fireEvent.click(deleteItem);

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute('type', 'button');
    expect(items[0]).toHaveTextContent('⌘N');
    expect(deleteItem).toHaveClass('hn-menu__item--danger');
    expect(within(menu).getByRole('separator')).toHaveClass('hn-menu__separator');
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('Given 已展开子菜单, When 选择菜单项, Then 立即关闭子菜单', () => {
    const onSelect = vi.fn();
    render(
      <Menu aria-label="卡片操作">
        <MenuSubmenu aria-label="子卡布局" label={<Icon name="sort" />} panelTheme="light">
          <MenuItem onClick={onSelect}>Free</MenuItem>
        </MenuSubmenu>
      </Menu>,
    );
    const submenuTrigger = screen.getByRole('menuitem', { name: '子卡布局' });
    expect(submenuTrigger).toHaveAttribute('aria-label', '子卡布局');
    fireEvent.click(submenuTrigger);

    const submenuItem = screen.getByRole('menuitem', { name: 'Free' });
    expect(submenuItem.closest('[role="menu"]')).toHaveAttribute('data-theme', 'light');
    fireEvent.click(submenuItem);

    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menuitem', { name: 'Free' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '子卡布局' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
