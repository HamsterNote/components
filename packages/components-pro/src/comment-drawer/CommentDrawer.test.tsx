import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    expect(
      screen.getByText((_, element) => element?.textContent === '我来补充验证数据。\n第二行结论。'),
    ).toBeVisible();
    expect(screen.getByText('周言')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('评论已发布。');
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
    expect(
      screen.getByText(
        (_, element) => element?.textContent === '摘要区已同步更新。\n引用也已补充。',
      ),
    ).toBeVisible();
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
    expect(screen.getByRole('status')).toHaveTextContent('回复已发布。');
  });

  it('Given 一条评论, When 编辑并保存, Then 内容立即回显且回调收到稳定 ID', async () => {
    const user = userEvent.setup();
    const onCommentEdit = vi.fn<(commentId: string, content: string) => void>();
    render(<CommentDrawer data={comments} onClose={vi.fn()} onCommentEdit={onCommentEdit} open />);

    const editTrigger = screen.getByRole('button', { name: '编辑林晓的评论' });
    await user.click(editTrigger);
    const editor = screen.getByRole('textbox', { name: '编辑林晓的评论' });
    await user.clear(editor);
    await user.type(editor, '研究结论已移动到摘要区。');
    await user.click(screen.getByRole('button', { name: '保存修改' }));

    expect(screen.getByText('研究结论已移动到摘要区。')).toBeVisible();
    expect(onCommentEdit).toHaveBeenCalledWith('comment-1', '研究结论已移动到摘要区。');
    await waitFor(() => {
      expect(editTrigger).toHaveFocus();
    });
  });

  it('Given 评论编辑器已打开, When 取消编辑, Then 焦点返回评论编辑触发器', async () => {
    const user = userEvent.setup();
    render(<CommentDrawer data={comments} onClose={vi.fn()} onCommentEdit={vi.fn()} open />);
    const editTrigger = screen.getByRole('button', { name: '编辑林晓的评论' });

    await user.click(editTrigger);
    await user.click(screen.getByRole('button', { name: '取消' }));

    expect(screen.queryByRole('textbox', { name: '编辑林晓的评论' })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(editTrigger).toHaveFocus();
    });
  });

  it('Given 一条回复, When 编辑并保存, Then 回复立即回显且回调收到根评论 ID', async () => {
    const user = userEvent.setup();
    const onReplyEdit = vi.fn<(commentId: string, replyId: string, content: string) => void>();
    render(<CommentDrawer data={comments} onClose={vi.fn()} onReplyEdit={onReplyEdit} open />);

    const editTrigger = screen.getByRole('button', { name: '编辑陈默的回复' });
    await user.click(editTrigger);
    const editor = screen.getByRole('textbox', { name: '编辑陈默的回复' });
    await user.clear(editor);
    await user.type(editor, '引用来源已经补充。');
    await user.click(screen.getByRole('button', { name: '保存修改' }));

    expect(screen.getByText('引用来源已经补充。')).toBeVisible();
    expect(onReplyEdit).toHaveBeenCalledWith('comment-1', 'reply-1', '引用来源已经补充。');
    await waitFor(() => {
      expect(editTrigger).toHaveFocus();
    });
  });

  it('Given 回复编辑器已打开, When 取消编辑, Then 焦点返回回复编辑触发器', async () => {
    const user = userEvent.setup();
    render(<CommentDrawer data={comments} onClose={vi.fn()} onReplyEdit={vi.fn()} open />);
    const editTrigger = screen.getByRole('button', { name: '编辑陈默的回复' });

    await user.click(editTrigger);
    await user.click(screen.getByRole('button', { name: '取消' }));

    expect(screen.queryByRole('textbox', { name: '编辑陈默的回复' })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(editTrigger).toHaveFocus();
    });
  });

  it('Given 删除评论确认框, When 先取消再确认, Then 仅确认后删除并触发回调', async () => {
    const user = userEvent.setup();
    const onCommentDelete = vi.fn<(commentId: string) => void>();
    render(
      <CommentDrawer data={comments} onClose={vi.fn()} onCommentDelete={onCommentDelete} open />,
    );

    await user.click(screen.getByRole('button', { name: '删除林晓的评论' }));
    expect(screen.getByRole('dialog', { name: '删除这条评论？' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: '取消' }));
    expect(screen.getByText('建议把研究结论移动到摘要区。')).toBeVisible();
    expect(onCommentDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '删除林晓的评论' }));
    await user.click(screen.getByRole('button', { name: '删除评论' }));

    expect(screen.queryByText('建议把研究结论移动到摘要区。')).not.toBeInTheDocument();
    expect(onCommentDelete).toHaveBeenCalledWith('comment-1');
  });

  it('Given 一条回复, When 确认删除, Then 仅移除目标回复并触发回调', async () => {
    const user = userEvent.setup();
    const onReplyDelete = vi.fn<(commentId: string, replyId: string) => void>();
    render(<CommentDrawer data={comments} onClose={vi.fn()} onReplyDelete={onReplyDelete} open />);

    await user.click(screen.getByRole('button', { name: '删除陈默的回复' }));
    await user.click(screen.getByRole('button', { name: '删除回复' }));

    expect(screen.queryByText('已移动，稍后补充引用来源。')).not.toBeInTheDocument();
    expect(screen.getByText('建议把研究结论移动到摘要区。')).toBeVisible();
    expect(onReplyDelete).toHaveBeenCalledWith('comment-1', 'reply-1');
  });

  it('Given 连续删除两条回复, When 播报相同结果, Then 公告位于模态外且替换消息节点', async () => {
    const user = userEvent.setup();
    const twoReplies: readonly CommentData[] = [
      {
        id: 'comment-1',
        author: '林晓',
        content: '建议把研究结论移动到摘要区。',
        createdAt: '2026-08-04T09:30:00+08:00',
        replies: [
          ...(comments[0]?.replies ?? []),
          {
            id: 'reply-2',
            author: '苏禾',
            content: '第二条回复。',
            createdAt: '2026-08-04T10:10:00+08:00',
          },
        ],
      },
    ];
    render(<CommentDrawer data={twoReplies} onClose={vi.fn()} onReplyDelete={vi.fn()} open />);

    await user.click(screen.getByRole('button', { name: '删除陈默的回复' }));
    await user.click(screen.getByRole('button', { name: '删除回复' }));
    const status = document.querySelector<HTMLElement>('[role="status"]');
    expect(status).not.toBeNull();
    if (status === null) {
      return;
    }
    const firstMessageNode = status.firstElementChild;
    expect(status.closest('.hn-comment-drawer')).toBeNull();
    expect(firstMessageNode).not.toBeNull();

    await user.click(screen.getByRole('button', { name: '删除苏禾的回复' }));
    await user.click(screen.getByRole('button', { name: '删除回复' }));

    expect(status).toHaveTextContent('回复已删除。');
    expect(status.firstElementChild).not.toBe(firstMessageNode);
  });

  it('Given 两个评论下存在相同回复 ID, When 编辑其中一条回复, Then 仅更新所属评论下的回复', async () => {
    const user = userEvent.setup();
    const duplicatedReplies: readonly CommentData[] = [
      ...comments,
      {
        id: 'comment-2',
        author: '周言',
        content: '第二条评论。',
        createdAt: '2026-08-04T10:00:00+08:00',
        replies: [
          {
            id: 'reply-1',
            author: '苏禾',
            content: '另一条同 ID 回复。',
            createdAt: '2026-08-04T10:10:00+08:00',
          },
        ],
      },
    ];
    render(<CommentDrawer data={duplicatedReplies} onClose={vi.fn()} onReplyEdit={vi.fn()} open />);

    await user.click(screen.getByRole('button', { name: '编辑苏禾的回复' }));
    const editor = screen.getByRole('textbox', { name: '编辑苏禾的回复' });
    await user.clear(editor);
    await user.type(editor, '仅更新第二条回复。');
    await user.click(screen.getByRole('button', { name: '保存修改' }));

    expect(screen.getByText('仅更新第二条回复。')).toBeVisible();
    expect(screen.getByText('已移动，稍后补充引用来源。')).toBeVisible();
  });

  it('Given 评论与回复使用相同 ID, When 编辑回复, Then 评论保持展示且仅回复进入编辑态', async () => {
    const user = userEvent.setup();
    const collidingEntries: readonly CommentData[] = [
      {
        id: 'shared-id',
        author: '林晓',
        content: '评论正文。',
        createdAt: '2026-08-04T09:30:00+08:00',
        replies: [
          {
            id: 'shared-id',
            author: '陈默',
            content: '回复正文。',
            createdAt: '2026-08-04T09:45:00+08:00',
          },
        ],
      },
    ];
    render(<CommentDrawer data={collidingEntries} onClose={vi.fn()} onReplyEdit={vi.fn()} open />);

    await user.click(screen.getByRole('button', { name: '编辑陈默的回复' }));

    expect(screen.getByText('评论正文。')).toBeVisible();
    expect(screen.getAllByRole('textbox', { name: /编辑/ })).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: '编辑陈默的回复' })).toBeVisible();
  });

  it('Given 不同评论下的回复使用相同 ID, When 展开其中一条回复, Then 仅目标回复标记为展开', async () => {
    const user = userEvent.setup();
    const duplicatedReplies: readonly CommentData[] = [
      ...comments,
      {
        id: 'comment-2',
        author: '周言',
        content: '第二条评论。',
        createdAt: '2026-08-04T10:00:00+08:00',
        replies: [
          {
            id: 'reply-1',
            author: '苏禾',
            content: '另一条同 ID 回复。',
            createdAt: '2026-08-04T10:10:00+08:00',
          },
        ],
      },
    ];
    render(<CommentDrawer data={duplicatedReplies} onClose={vi.fn()} open />);

    const firstReplyTrigger = screen.getByRole('button', { name: '回复陈默的回复' });
    const secondReplyTrigger = screen.getByRole('button', { name: '回复苏禾的回复' });
    await user.click(secondReplyTrigger);

    expect(firstReplyTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(secondReplyTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('textbox', { name: '回复苏禾' })).toBeVisible();
  });

  it('Given 评论与回复使用相同 ID, When 切换回复目标, Then 展开状态按条目类型切换', async () => {
    const user = userEvent.setup();
    const collidingEntries: readonly CommentData[] = [
      {
        id: 'shared-id',
        author: '林晓',
        content: '评论正文。',
        createdAt: '2026-08-04T09:30:00+08:00',
        replies: [
          {
            id: 'shared-id',
            author: '陈默',
            content: '回复正文。',
            createdAt: '2026-08-04T09:45:00+08:00',
          },
        ],
      },
    ];
    render(<CommentDrawer data={collidingEntries} onClose={vi.fn()} open />);

    const commentTrigger = screen.getByRole('button', { name: '回复林晓的评论' });
    const replyTrigger = screen.getByRole('button', { name: '回复陈默的回复' });
    await user.click(replyTrigger);

    expect(commentTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(replyTrigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(commentTrigger);

    expect(commentTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(replyTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('textbox', { name: '回复林晓' })).toBeVisible();
  });
});
