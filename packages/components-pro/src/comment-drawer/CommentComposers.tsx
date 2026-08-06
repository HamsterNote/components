import { Button } from '@hamster-note/components/button';
import type { SyntheticEvent } from 'react';

import type { ReplyTarget } from './CommentEntry';
import { CommentNoteEditor } from './CommentNoteEditor';

interface CommentComposerProps {
  readonly draft: string;
  readonly labelId: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => void;
}

export function CommentComposer({ draft, labelId, onChange, onSubmit }: CommentComposerProps) {
  const canSubmit = draft.trim().length > 0;

  return (
    <form className="hn-comment-drawer__composer" onSubmit={onSubmit}>
      <label id={labelId}>添加评论</label>
      <CommentNoteEditor
        labelId={labelId}
        onChange={onChange}
        placeholder="写下你的想法…"
        value={draft}
      />
      <div className="hn-comment-drawer__actions">
        <span>{canSubmit ? '评论将立即显示' : '输入评论后即可发布'}</span>
        <Button disabled={!canSubmit} type="submit" variant="primary">
          发布评论
        </Button>
      </div>
    </form>
  );
}

interface ReplyComposerProps {
  readonly draft: string;
  readonly id: string;
  readonly onCancel: () => void;
  readonly onChange: (value: string) => void;
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => void;
  readonly target: ReplyTarget;
}

export function ReplyComposer({
  draft,
  id,
  onCancel,
  onChange,
  onSubmit,
  target,
}: ReplyComposerProps) {
  const labelId = `${id}-label`;

  return (
    <form className="hn-comment-drawer__reply-composer" id={id} onSubmit={onSubmit}>
      <label id={labelId}>回复{target.author}</label>
      <CommentNoteEditor
        autoFocus
        labelId={labelId}
        onChange={onChange}
        placeholder="写下回复…"
        value={draft}
      />
      <div className="hn-comment-drawer__reply-actions">
        <Button ghost onClick={onCancel} size="small">
          取消
        </Button>
        <Button disabled={draft.trim().length === 0} size="small" type="submit" variant="primary">
          发布回复
        </Button>
      </div>
    </form>
  );
}
