import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Confirm, Dialog, Drawer, ThemeProvider } from '../index';

describe('模态组件契约', () => {
  it('Given 打开的对话框, When 渲染, Then Portal、命名关系和滚动锁完整生效', () => {
    render(
      <Dialog description="不可撤销" onClose={vi.fn()} open title="删除笔记">
        内容
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { name: '删除笔记' });
    expect(dialog.parentElement).toBe(document.body);
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('不可撤销');
    expect(dialog).toHaveAttribute('data-state', 'enter');
    expect(document.body).toHaveStyle({ overflow: 'hidden' });
  });

  it('Given 可关闭和全屏的对话框, When 切换全屏并关闭, Then 状态类和回调保持稳定', () => {
    const onClose = vi.fn();
    render(
      <Dialog onClose={onClose} open showCloseButton showFullscreenButton title="移动笔记">
        内容
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { name: '移动笔记' });
    const fullscreen = screen.getByRole('button', { name: '全屏显示' });
    fireEvent.click(fullscreen);

    expect(dialog).toHaveClass('hn-dialog__panel--fullscreen');
    expect(screen.getByRole('button', { name: '退出全屏' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: '关闭对话框' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('Given 打开的对话框, When 按 Escape, Then 调用关闭回调', () => {
    const onClose = vi.fn();
    render(
      <Dialog onClose={onClose} open title="快捷关闭">
        内容
      </Dialog>,
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('Given 禁用 Escape 的对话框, When 按 Escape, Then 不触发关闭', () => {
    const onClose = vi.fn();
    render(
      <Dialog closeOnEsc={false} onClose={onClose} open title="保持打开">
        内容
      </Dialog>,
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Given 自定义左侧抽屉, When 渲染并切换全屏, Then 方向、尺寸和状态保持稳定', () => {
    render(
      <Drawer
        onClose={vi.fn()}
        open
        placement="left"
        showFullscreenButton
        size={520}
        title="笔记详情"
      >
        内容
      </Drawer>,
    );

    const drawer = screen.getByRole('dialog', { name: '笔记详情' });
    expect(drawer).toHaveClass('hn-drawer__panel--left');
    expect(drawer.style.getPropertyValue('--hn-drawer-size')).toBe('520px');

    fireEvent.click(screen.getByRole('button', { name: '全屏显示抽屉' }));
    expect(drawer).toHaveClass('hn-drawer__panel--fullscreen');
    expect(screen.getByRole('button', { name: '恢复自适应大小' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('Given 主题内的对话框, When Portal 渲染, Then 主题桥接层保留 accent 与 mode', () => {
    render(
      <ThemeProvider accent="teal" mode="light">
        <Dialog onClose={vi.fn()} open title="主题对话框">
          内容
        </Dialog>
      </ThemeProvider>,
    );

    const dialog = screen.getByRole('dialog', { name: '主题对话框' });
    expect(dialog.parentElement).toHaveClass('hn-theme');
    expect(dialog.parentElement).toHaveAttribute('data-accent', 'teal');
    expect(dialog.parentElement).toHaveAttribute('data-mode', 'light');
  });

  it('Given 危险确认框, When 点击确认与取消, Then 各自回调且危险样式稳定', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <Confirm
        confirmText="删除"
        description="无法恢复"
        onCancel={onCancel}
        onConfirm={onConfirm}
        open
        title="删除笔记？"
        tone="danger"
      />,
    );

    const confirmButton = screen.getByRole('button', { name: '删除' });
    expect(confirmButton).toHaveClass('hn-button--danger');
    fireEvent.click(confirmButton);
    fireEvent.click(screen.getByRole('button', { name: '取消' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('Given 加载中的确认框, When 渲染, Then 两个动作禁用且文案进入处理中状态', () => {
    render(<Confirm loading onCancel={vi.fn()} onConfirm={vi.fn()} open title="保存修改？" />);

    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '处理中…' })).toBeDisabled();
  });
});
