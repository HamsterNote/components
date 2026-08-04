import { Button } from '@hamster-note/components';
import { CommentDrawer, type CommentData } from '@hamster-note/components-pro';
import { useState } from 'react';

interface CommentsDemoProps {
  readonly onFeedback: (message: string) => void;
}

const initialComments: readonly CommentData[] = [
  {
    id: 'research-note',
    author: '林晓',
    content: '建议把访谈中的共同结论提前到摘要区。',
    createdAt: '2026-08-04T09:30:00+08:00',
    replies: [
      {
        id: 'research-note-reply',
        author: '陈默',
        content: '收到，我会在下午的版本里调整。',
        createdAt: '2026-08-04T09:42:00+08:00',
      },
    ],
  },
  {
    id: 'follow-up',
    author: '陈默',
    content: '已补充三条验证数据，等待下一轮评审。',
    createdAt: '2026-08-04T10:05:00+08:00',
  },
];

export function CommentsDemo({ onFeedback }: CommentsDemoProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="component-row">
      <Button
        onClick={() => {
          setOpen(true);
          onFeedback('已打开 Pro 评论面板');
        }}
        variant="primary"
      >
        查看评论
      </Button>
      <span className="demo-inline-note">2 条讨论 · 使用基础 Drawer 容器</span>
      <CommentDrawer
        currentAuthor="周言"
        data={initialComments}
        onClose={() => {
          setOpen(false);
          onFeedback('已关闭 Pro 评论面板');
        }}
        onCommentAdd={(content) => {
          onFeedback(`已发布评论：${content}`);
        }}
        onReplyAdd={(_commentId, content) => {
          onFeedback(`已发布回复：${content}`);
        }}
        open={open}
        title="研究摘要评论"
      />
    </div>
  );
}
