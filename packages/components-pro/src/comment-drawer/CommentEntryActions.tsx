import { Button } from '@hamster-note/components/button';
import { Icon } from '@hamster-note/components/icon';

interface EntryActionsProps {
  readonly author: string;
  readonly entryKind: '评论' | '回复';
  readonly onDelete?: (() => void) | undefined;
  readonly onEdit?: ((trigger: HTMLButtonElement) => void) | undefined;
}

export function EntryActions({ author, entryKind, onDelete, onEdit }: EntryActionsProps) {
  if (onEdit === undefined && onDelete === undefined) {
    return null;
  }

  return (
    <div className="hn-comment-drawer__entry-actions">
      {onEdit !== undefined ? (
        <Button
          aria-label={`编辑${author}的${entryKind}`}
          ghost
          onClick={(event) => {
            onEdit(event.currentTarget);
          }}
          size="small"
        >
          <Icon aria-hidden name="edit" />
        </Button>
      ) : null}
      {onDelete !== undefined ? (
        <Button
          aria-label={`删除${author}的${entryKind}`}
          ghost
          onClick={onDelete}
          size="small"
          variant="danger"
        >
          <Icon aria-hidden name="delete" />
        </Button>
      ) : null}
    </div>
  );
}

export function EntryMeta({
  author,
  createdAt,
}: {
  readonly author: string;
  readonly createdAt: string;
}) {
  return (
    <div className="hn-comment-drawer__meta">
      <strong>{author}</strong>
      <time dateTime={createdAt}>
        {new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(
          new Date(createdAt),
        )}
      </time>
    </div>
  );
}
