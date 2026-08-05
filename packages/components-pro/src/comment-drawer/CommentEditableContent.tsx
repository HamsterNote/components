import { Button } from '@hamster-note/components/button';
import { useId, useState } from 'react';

import { CommentNoteEditor } from './CommentNoteEditor';

interface CommentEditableContentProps {
  readonly author: string;
  readonly content: string;
  readonly editing: boolean;
  readonly entryKind: '评论' | '回复';
  readonly onCancel: () => void;
  readonly onSave?: ((content: string) => void) | undefined;
}

export function CommentEditableContent({
  author,
  content,
  editing,
  entryKind,
  onCancel,
  onSave,
}: CommentEditableContentProps) {
  const labelId = useId();
  const [draft, setDraft] = useState(content);
  const trimmedDraft = draft.trim();
  const label = `编辑${author}的${entryKind}`;

  if (!editing) {
    return <p>{content}</p>;
  }

  return (
    <form
      className="hn-comment-drawer__edit-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (trimmedDraft.length === 0) {
          return;
        }
        onSave?.(trimmedDraft);
      }}
    >
      <label id={labelId}>{label}</label>
      <CommentNoteEditor
        autoFocus
        labelId={labelId}
        onChange={setDraft}
        placeholder="修改内容…"
        value={draft}
      />
      <div className="hn-comment-drawer__edit-actions">
        <Button
          ghost
          onClick={() => {
            setDraft(content);
            onCancel();
          }}
          size="small"
        >
          取消
        </Button>
        <Button disabled={trimmedDraft.length === 0} size="small" type="submit" variant="primary">
          保存修改
        </Button>
      </div>
    </form>
  );
}
