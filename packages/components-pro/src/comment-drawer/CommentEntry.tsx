import { Button } from '@hamster-note/components/button';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { CommentEditableContent } from './CommentEditableContent';
import { EntryActions, EntryMeta } from './CommentEntryActions';
import type { CommentData, CommentReplyData } from './comment-drawer-model';

export type ReplyTarget =
  | {
      readonly kind: 'comment';
      readonly commentId: string;
      readonly id: string;
      readonly author: string;
    }
  | {
      readonly kind: 'reply';
      readonly commentId: string;
      readonly id: string;
      readonly author: string;
    };

interface CommentEntryProps {
  readonly activeReplyTarget?: ReplyTarget | undefined;
  readonly comment: CommentData;
  readonly onCommentDelete?: ((commentId: string) => void) | undefined;
  readonly onCommentEdit?: ((commentId: string, content: string) => void) | undefined;
  readonly onReplyDelete?: ((commentId: string, replyId: string) => void) | undefined;
  readonly onReplyEdit?:
    ((commentId: string, replyId: string, content: string) => void) | undefined;
  readonly onReplyRequest: (target: ReplyTarget, trigger: HTMLButtonElement) => void;
  readonly replies: readonly CommentReplyData[];
  readonly replyComposer?: ReactNode | undefined;
  readonly replyComposerId: string;
}

type EditingTarget =
  { readonly kind: 'comment' } | { readonly kind: 'reply'; readonly replyId: string };

export function CommentEntry({
  activeReplyTarget,
  comment,
  onCommentDelete,
  onCommentEdit,
  onReplyDelete,
  onReplyEdit,
  onReplyRequest,
  replies,
  replyComposer,
  replyComposerId,
}: CommentEntryProps) {
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(null);
  const editTriggerRef = useRef<HTMLButtonElement | null>(null);
  const focusFrameRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (focusFrameRef.current !== null) {
        cancelAnimationFrame(focusFrameRef.current);
      }
    },
    [],
  );

  const finishEditing = () => {
    const editTrigger = editTriggerRef.current;
    const drawer = editTrigger?.closest<HTMLElement>('.hn-comment-drawer') ?? null;
    setEditingTarget(null);
    focusFrameRef.current = requestAnimationFrame(() => {
      if (editTrigger?.isConnected === true) {
        editTrigger.focus();
        return;
      }
      drawer?.focus();
    });
  };

  return (
    <li className="hn-comment-drawer__comment">
      <EntryMeta author={comment.author} createdAt={comment.createdAt} />
      <CommentEditableContent
        author={comment.author}
        content={comment.content}
        editing={editingTarget?.kind === 'comment'}
        entryKind="评论"
        key={comment.content}
        onCancel={() => {
          finishEditing();
        }}
        onSave={
          onCommentEdit === undefined
            ? undefined
            : (content) => {
                onCommentEdit(comment.id, content);
                finishEditing();
              }
        }
      />
      <div className="hn-comment-drawer__entry-footer">
        <Button
          aria-controls={
            activeReplyTarget?.kind === 'comment' &&
            activeReplyTarget.commentId === comment.id &&
            activeReplyTarget.id === comment.id
              ? replyComposerId
              : undefined
          }
          aria-expanded={
            activeReplyTarget?.kind === 'comment' &&
            activeReplyTarget.commentId === comment.id &&
            activeReplyTarget.id === comment.id
          }
          aria-label={`回复${comment.author}的评论`}
          className="hn-comment-drawer__reply-trigger"
          ghost
          onClick={(event) => {
            onReplyRequest(
              { kind: 'comment', commentId: comment.id, id: comment.id, author: comment.author },
              event.currentTarget,
            );
          }}
          size="small"
        >
          回复
        </Button>
        <EntryActions
          author={comment.author}
          entryKind="评论"
          onDelete={
            onCommentDelete === undefined
              ? undefined
              : () => {
                  onCommentDelete(comment.id);
                }
          }
          onEdit={
            onCommentEdit === undefined
              ? undefined
              : (trigger) => {
                  editTriggerRef.current = trigger;
                  setEditingTarget({ kind: 'comment' });
                }
          }
        />
      </div>

      {replies.length > 0 ? (
        <ol aria-label={`${comment.author}的评论回复`} className="hn-comment-drawer__replies">
          {replies.map((reply) => (
            <li className="hn-comment-drawer__reply" key={reply.id}>
              <EntryMeta author={reply.author} createdAt={reply.createdAt} />
              {reply.replyTo !== undefined ? (
                <span className="hn-comment-drawer__reply-target">回复 {reply.replyTo.author}</span>
              ) : null}
              <CommentEditableContent
                author={reply.author}
                content={reply.content}
                editing={editingTarget?.kind === 'reply' && editingTarget.replyId === reply.id}
                entryKind="回复"
                key={reply.content}
                onCancel={() => {
                  finishEditing();
                }}
                onSave={
                  onReplyEdit === undefined
                    ? undefined
                    : (content) => {
                        onReplyEdit(comment.id, reply.id, content);
                        finishEditing();
                      }
                }
              />
              <div className="hn-comment-drawer__entry-footer">
                <Button
                  aria-controls={
                    activeReplyTarget?.kind === 'reply' &&
                    activeReplyTarget.commentId === comment.id &&
                    activeReplyTarget.id === reply.id
                      ? replyComposerId
                      : undefined
                  }
                  aria-expanded={
                    activeReplyTarget?.kind === 'reply' &&
                    activeReplyTarget.commentId === comment.id &&
                    activeReplyTarget.id === reply.id
                  }
                  aria-label={`回复${reply.author}的回复`}
                  className="hn-comment-drawer__reply-trigger"
                  ghost
                  onClick={(event) => {
                    onReplyRequest(
                      {
                        commentId: comment.id,
                        id: reply.id,
                        author: reply.author,
                        kind: 'reply',
                      },
                      event.currentTarget,
                    );
                  }}
                  size="small"
                >
                  回复
                </Button>
                <EntryActions
                  author={reply.author}
                  entryKind="回复"
                  onDelete={
                    onReplyDelete === undefined
                      ? undefined
                      : () => {
                          onReplyDelete(comment.id, reply.id);
                        }
                  }
                  onEdit={
                    onReplyEdit === undefined
                      ? undefined
                      : (trigger) => {
                          editTriggerRef.current = trigger;
                          setEditingTarget({ kind: 'reply', replyId: reply.id });
                        }
                  }
                />
              </div>
            </li>
          ))}
        </ol>
      ) : null}
      {replyComposer}
    </li>
  );
}
