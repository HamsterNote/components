export interface CommentReplyData {
  readonly id: string;
  readonly author: string;
  readonly content: string;
  readonly createdAt: string;
  /** 回复另一条回复时记录目标，渲染仍保持在根评论下的同一层。 */
  readonly replyTo?: {
    readonly id: string;
    readonly author: string;
  };
}

export interface CommentData extends CommentReplyData {
  readonly replies?: readonly CommentReplyData[];
}

export type CommentEntry = CommentData;

export interface CommentDrawerProps {
  readonly comments?: readonly CommentData[];
  readonly currentAuthor?: string;
  readonly data?: readonly CommentData[];
  readonly onClose: () => void;
  readonly onCommentAdd?: (content: string) => void;
  readonly onCommentDelete?: (commentId: string) => void;
  readonly onCommentEdit?: (commentId: string, content: string) => void;
  readonly onReplyAdd?: (commentId: string, content: string, reply: CommentReplyData) => void;
  readonly onReplyDelete?: (commentId: string, replyId: string) => void;
  readonly onReplyEdit?: (commentId: string, replyId: string, content: string) => void;
  readonly open: boolean;
  readonly title?: string;
}

export type DeleteTarget =
  | { readonly kind: 'comment'; readonly commentId: string }
  | { readonly kind: 'reply'; readonly commentId: string; readonly replyId: string };

export function readComposerValue(form: HTMLFormElement) {
  return Array.from(
    form.querySelectorAll<HTMLElement>('.hn-note-body [role="textbox"]'),
    (editable) => editable.textContent,
  )
    .join('\n')
    .trim();
}
