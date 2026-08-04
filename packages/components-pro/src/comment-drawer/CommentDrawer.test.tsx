import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CommentDrawer, type CommentData, type CommentReplyData } from './CommentDrawer';

const comments: readonly CommentData[] = [
  {
    id: 'comment-1',
    author: '林晓',
    content: '建议把研究结论移动到摘要区。',
    createdAt: '2026-08-04T09:30:00+08:00',
    replies: [
      {
        id: 'reply-1',
        author: '陈默',
        content: '已移动，稍后补充引用来源。',
        createdAt: '2026-08-04T09:45:00+08:00',
      },
    ],
  },
];

describe('CommentDrawer', () => {
  it('Given 初始评论, When 打开抽屉, Then 展示评论内容和作者', () => {
    render(<CommentDrawer data={comments} onClose={vi.fn()} open />);

    expect(screen.getByText('林晓')).toBeVisible();
    expect(screen.getByText('建议把研究结论移动到摘要区。')).toBeVisible();
    expect(screen.getByText('陈默')).toBeVisible();
    expect(screen.getByText('已移动，稍后补充引用来源。')).toBeVisible();
  });

  it('Given 空白输入, When 编辑评论, Then 提交按钮保持禁用', async () => {
    const user = userEvent.setup();
    render(<CommentDrawer data={comments} onClose={vi.fn()} open />);

    await user.type(screen.getByRole('textbox', { name: '添加评论' }), '   ');

    expect(screen.getByRole('button', { name: '发布评论' })).toBeDisabled();
  });

  it('Given 多行评论, When 发布, Then 回调保留换行且输入框清空', async () => {
    const user = userEvent.setup();
    const onCommentAdd = vi.fn();
    render(
      <CommentDrawer
        data={comments}
        currentAuthor="周言"
        onClose={vi.fn()}
        onCommentAdd={onCommentAdd}
        open
      />,
    );
    const composer = screen.getByRole('textbox', { name: '添加评论' });

    composer.textContent = '我来补充验证数据。';
    fireEvent.input(composer, { inputType: 'insertText' });
    const range = document.createRange();
    range.selectNodeContents(composer);
    range.collapse(false);
    composer.focus();
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    await user.keyboard('{Enter}');
    const [, nextCommentEditor] = await screen.findAllByRole('textbox', { name: '添加评论' });
    expect(nextCommentEditor).toBeDefined();
    if (nextCommentEditor === undefined) {
      return;
    }
    await user.type(nextCommentEditor, '第二行结论。');
    await user.click(screen.getByRole('button', { name: '发布评论' }));

    expect(onCommentAdd).toHaveBeenCalledWith('我来补充验证数据。\n第二行结论。');
    expect(screen.getByRole('textbox', { name: '添加评论' })).toBeEmptyDOMElement();
    expect(screen.getByText((_, element) => element?.textContent === '我来补充验证数据。\n第二行结论。')).toBeVisible();
    expect(screen.getByText('周言')).toBeVisible();
  });

  it('Given 一条评论, When 回复并发布, Then 回调收到类型化回复且焦点返回触发器', async () => {
    const user = userEvent.setup();
    const onReplyAdd =
      vi.fn<(commentId: string, content: string, reply: CommentReplyData) => void>();
    const { rerender } = render(
      <CommentDrawer
        currentAuthor="周言"
        data={comments}
        onClose={vi.fn()}
        onReplyAdd={onReplyAdd}
        open
      />,
    );

    const replyTrigger = screen.getByRole('button', { name: '回复林晓的评论' });
    await user.click(replyTrigger);
    const replyComposer = screen.getByRole('textbox', { name: '回复林晓' });
    await user.type(replyComposer, '摘要区已同步更新。{Enter}');
    const [, nextReplyEditor] = await screen.findAllByRole('textbox', { name: '回复林晓' });
    expect(nextReplyEditor).toBeDefined();
    if (nextReplyEditor === undefined) {
      return;
    }
    await user.type(nextReplyEditor, '引用也已补充。');
    await user.click(screen.getByRole('button', { name: '发布回复' }));

    expect(onReplyAdd).toHaveBeenCalledWith(
      'comment-1',
      '摘要区已同步更新。\n引用也已补充。',
      expect.objectContaining({
        author: '周言',
        content: '摘要区已同步更新。\n引用也已补充。',
      }),
    );
    expect(replyComposer).not.toBeInTheDocument();
    expect(replyTrigger).toHaveFocus();
    expect(screen.getByText((_, element) => element?.textContent === '摘要区已同步更新。\n引用也已补充。')).toBeVisible();
    expect(screen.getAllByText('周言')).toHaveLength(1);

    const persistedReply = onReplyAdd.mock.calls[0]?.[2];
    expect(persistedReply).toBeDefined();
    if (persistedReply === undefined) {
      return;
    }
    const updatedComments: readonly CommentData[] = [
      {
        id: 'comment-1',
        author: '林晓',
        content: '建议把研究结论移动到摘要区。',
        createdAt: '2026-08-04T09:30:00+08:00',
        replies: [...(comments[0]?.replies ?? []), persistedReply],
      },
    ];
    rerender(
      <CommentDrawer
        currentAuthor="周言"
        data={updatedComments}
        onClose={vi.fn()}
        onReplyAdd={onReplyAdd}
        open
      />,
    );

    expect(
      screen.getAllByText(
        (_, element) => element?.textContent === '摘要区已同步更新。\n引用也已补充。',
      ),
    ).toHaveLength(1);
  });

  it('Given 回复编辑器已展开, When 取消回复, Then 编辑器关闭且焦点返回触发器', async () => {
    const user = userEvent.setup();
    render(<CommentDrawer data={comments} onClose={vi.fn()} open />);
    const replyTrigger = screen.getByRole('button', { name: '回复林晓的评论' });

    await user.click(replyTrigger);
    await user.click(screen.getByRole('button', { name: '取消' }));

    expect(screen.queryByRole('textbox', { name: '回复林晓' })).not.toBeInTheDocument();
    expect(replyTrigger).toHaveFocus();
  });

  it('Given 已有楼中楼回复, When 回复该回复, Then 新回复保持扁平并记录目标', async () => {
    const user = userEvent.setup();
    const onReplyAdd =
      vi.fn<(commentId: string, content: string, reply: CommentReplyData) => void>();
    render(
      <CommentDrawer
        currentAuthor="周言"
        data={comments}
        onClose={vi.fn()}
        onReplyAdd={onReplyAdd}
        open
      />,
    );

    const replyTrigger = screen.getByRole('button', { name: '回复陈默的回复' });
    await user.click(replyTrigger);
    expect(screen.getByRole('textbox', { name: '回复陈默' })).toBeVisible();

    await user.type(screen.getByRole('textbox', { name: '回复陈默' }), '引用来源也请一并补充。');
    await user.click(screen.getByRole('button', { name: '发布回复' }));

    expect(onReplyAdd).toHaveBeenCalledWith(
      'comment-1',
      '引用来源也请一并补充。',
      expect.objectContaining({
        replyTo: { id: 'reply-1', author: '陈默' },
      }),
    );
    expect(screen.getByText('引用来源也请一并补充。')).toBeVisible();
    expect(screen.getByText('回复 陈默')).toBeVisible();
    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(replyTrigger).toHaveFocus();
  });
});
