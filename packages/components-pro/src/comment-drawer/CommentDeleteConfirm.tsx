import { Confirm } from '@hamster-note/components/confirm';
import type { RefObject } from 'react';

import type { DeleteTarget } from './comment-drawer-model';

interface CommentDeleteConfirmProps {
  readonly finalFocusRef: RefObject<HTMLElement | null>;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly target: DeleteTarget | null;
}

export function CommentDeleteConfirm({
  finalFocusRef,
  onCancel,
  onConfirm,
  target,
}: CommentDeleteConfirmProps) {
  const deletingReply = target?.kind === 'reply';

  return (
    <Confirm
      confirmText={deletingReply ? '删除回复' : '删除评论'}
      description="删除后将立即移除，无法撤销。"
      finalFocusRef={finalFocusRef}
      layer="elevated"
      onCancel={onCancel}
      onConfirm={onConfirm}
      open={target !== null}
      title={deletingReply ? '删除这条回复？' : '删除这条评论？'}
      tone="danger"
    />
  );
}
