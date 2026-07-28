import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { ConfirmProvider, hideLoading, showLoading, useConfirm } from '../index';

function ConfirmHarness() {
  const confirm = useConfirm();
  const [result, setResult] = useState('等待');

  return (
    <>
      <button
        onClick={() => {
          void confirm({ title: '保存修改？', confirmText: '保存' }).then((accepted) => {
            setResult(accepted ? '已确认' : '已取消');
          });
        }}
        type="button"
      >
        请求确认
      </button>
      <output>{result}</output>
    </>
  );
}

describe('命令式 API 契约', () => {
  it('Given ConfirmProvider, When 用户确认, Then Promise 结果回写为 true', async () => {
    render(
      <ConfirmProvider>
        <ConfirmHarness />
      </ConfirmProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '请求确认' }));
    fireEvent.click(await screen.findByRole('button', { name: '保存' }));

    expect(await screen.findByText('已确认')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Given ConfirmProvider, When 用户取消, Then Promise 结果回写为 false', async () => {
    render(
      <ConfirmProvider>
        <ConfirmHarness />
      </ConfirmProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '请求确认' }));
    fireEvent.click(await screen.findByRole('button', { name: '取消' }));

    expect(await screen.findByText('已取消')).toBeInTheDocument();
  });

  it('Given 首次显示全屏 Loading, When 调用 showLoading, Then 创建单例遮罩和指定文案', () => {
    act(() => {
      showLoading({ size: 'large', text: '正在发布' });
    });

    const overlay = document.querySelector('.hn-loading-overlay');
    expect(overlay).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '正在发布' })).toHaveClass('hn-loading--large');
    expect(document.querySelectorAll('.hn-loading-overlay')).toHaveLength(1);
  });

  it('Given 已显示的全屏 Loading, When 再次显示, Then 复用单例并更新内容', () => {
    act(() => {
      showLoading({ text: '第一步' });
      showLoading({ size: 'small', text: '第二步' });
    });

    expect(document.querySelectorAll('.hn-loading-overlay')).toHaveLength(1);
    expect(screen.getByRole('status', { name: '第二步' })).toHaveClass('hn-loading--small');
    expect(screen.queryByText('第一步')).not.toBeInTheDocument();
  });

  it('Given 已显示的全屏 Loading, When 调用 hideLoading, Then 清理遮罩容器', async () => {
    act(() => {
      showLoading({ text: '即将隐藏' });
    });

    await act(async () => {
      hideLoading();
      await Promise.resolve();
    });

    expect(document.querySelector('.hn-loading-overlay')).not.toBeInTheDocument();
  });
});
