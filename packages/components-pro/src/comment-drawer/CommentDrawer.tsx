import { Button } from '@hamster-note/components/button';
import { Drawer } from '@hamster-note/components/drawer';
import { useId, useRef, useState, type SyntheticEvent } from 'react';

import { CommentNoteEditor } from './CommentNoteEditor';

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

interface ReplyTarget {
  readonly commentId: string;
  readonly id: string;
  readonly author: string;
  readonly isReply: boolean;
}

export interface CommentDrawerProps {
  readonly comments?: readonly CommentData[];
  readonly currentAuthor?: string;
  readonly data?: readonly CommentData[];
  readonly onClose: () => void;
  readonly onCommentAdd?: (content: string) => void;
  readonly onReplyAdd?: (commentId: string, content: string, reply: CommentReplyData) => void;
  readonly open: boolean;
  readonly title?: string;
}

export function CommentDrawer({
  comments = [],
  currentAuthor = '你',
  data,
  onClose,
  onCommentAdd,
  onReplyAdd,
  open,
  title = '评论',
}: CommentDrawerProps) {
  const composerId = useId();
  const replyComposerId = useId();
  const replyTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [draft, setDraft] = useState('');
  const [replyDraft, setReplyDraft] = useState('');
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [localComments, setLocalComments] = useState<readonly CommentData[]>([]);
  const [localReplies, setLocalReplies] = useState<
    Readonly<Record<string, readonly CommentReplyData[]>>
  >({});
  const trimmedDraft = draft.trim();
  const trimmedReplyDraft = replyDraft.trim();
  const visibleComments = [...(data ?? comments), ...localComments];

  function readComposerValue(form: HTMLFormElement) {
    return Array.from(
      form.querySelectorAll<HTMLElement>('.hn-note-body [role="textbox"]'),
      (editable) => editable.textContent ?? '',
    )
      .join('\n')
      .trim();
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const content = readComposerValue(event.currentTarget);
    if (content.length === 0) {
      return;
    }

    const comment: CommentEntry = {
      id: `${composerId}-${(localComments.length + 1).toString()}`,
      author: currentAuthor,
      content,
      createdAt: new Date().toISOString(),
    };

    setLocalComments((current) => [...current, comment]);
    setDraft('');
    onCommentAdd?.(content);
  }

  function handleReplySubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
    target: ReplyTarget,
  ) {
    event.preventDefault();
    const content = readComposerValue(event.currentTarget);
    if (content.length === 0) {
      return;
    }

    const reply: CommentReplyData = {
      id: `${replyComposerId}-${target.commentId}-${((localReplies[target.commentId]?.length ?? 0) + 1).toString()}`,
      author: currentAuthor,
      content,
      createdAt: new Date().toISOString(),
      ...(target.isReply ? { replyTo: { id: target.id, author: target.author } } : {}),
    };

    setLocalReplies((current) => ({
      ...current,
      [target.commentId]: [...(current[target.commentId] ?? []), reply],
    }));
    setReplyDraft('');
    replyTriggerRef.current?.focus();
    setReplyTarget(null);
    onReplyAdd?.(target.commentId, content, reply);
  }

  function toggleReplyComposer(target: ReplyTarget, trigger: HTMLButtonElement) {
    replyTriggerRef.current = trigger;
    setReplyDraft('');
    setReplyTarget((current) => (current?.id === target.id ? null : target));
  }

  return (
    <Drawer
      className="hn-comment-drawer"
      description="查看讨论并添加新评论。"
      onClose={onClose}
      open={open}
      showCloseButton
      size={400}
      title={title}
    >
      <div aria-live="polite" className="hn-comment-drawer__feed">
        {visibleComments.length === 0 ? (
          <p className="hn-comment-drawer__empty">还没有评论，开始这段讨论。</p>
        ) : (
          <ol className="hn-comment-drawer__list">
            {visibleComments.map((comment) => {
              const persistedReplies = comment.replies ?? [];
              const replies = [
                ...persistedReplies,
                ...(localReplies[comment.id] ?? []).filter(
                  (localReply) => !persistedReplies.some((reply) => reply.id === localReply.id),
                ),
              ];

              return (
                <li className="hn-comment-drawer__comment" key={comment.id}>
                  <div className="hn-comment-drawer__meta">
                    <strong>{comment.author}</strong>
                    <time dateTime={comment.createdAt}>
                      {new Intl.DateTimeFormat('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(comment.createdAt))}
                    </time>
                  </div>
                  <p>{comment.content}</p>
                  <Button
                    aria-controls={replyTarget?.id === comment.id ? replyComposerId : undefined}
                    aria-expanded={replyTarget?.id === comment.id}
                    aria-label={`回复${comment.author}的评论`}
                    className="hn-comment-drawer__reply-trigger"
                    ghost
                    onClick={(event) => {
                      toggleReplyComposer(
                        {
                          commentId: comment.id,
                          id: comment.id,
                          author: comment.author,
                          isReply: false,
                        },
                        event.currentTarget,
                      );
                    }}
                    size="small"
                  >
                    回复
                  </Button>
                  {replies.length > 0 ? (
                    <ol
                      aria-label={`${comment.author}的评论回复`}
                      className="hn-comment-drawer__replies"
                    >
                      {replies.map((reply) => (
                        <li className="hn-comment-drawer__reply" key={reply.id}>
                          <div className="hn-comment-drawer__meta">
                            <strong>{reply.author}</strong>
                            <time dateTime={reply.createdAt}>
                              {new Intl.DateTimeFormat('zh-CN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              }).format(new Date(reply.createdAt))}
                            </time>
                          </div>
                          <p>
                            {reply.replyTo !== undefined ? (
                              <span className="hn-comment-drawer__reply-target">
                                回复 {reply.replyTo.author}
                              </span>
                            ) : null}
                            {reply.content}
                          </p>
                          <Button
                            aria-controls={
                              replyTarget?.id === reply.id ? replyComposerId : undefined
                            }
                            aria-expanded={replyTarget?.id === reply.id}
                            aria-label={`回复${reply.author}的回复`}
                            className="hn-comment-drawer__reply-trigger"
                            ghost
                            onClick={(event) => {
                              toggleReplyComposer(
                                {
                                  commentId: comment.id,
                                  id: reply.id,
                                  author: reply.author,
                                  isReply: true,
                                },
                                event.currentTarget,
                              );
                            }}
                            size="small"
                          >
                            回复
                          </Button>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  {replyTarget?.commentId === comment.id ? (
                    <form
                      className="hn-comment-drawer__reply-composer"
                      id={replyComposerId}
                      onSubmit={(event) => {
                        handleReplySubmit(event, replyTarget);
                      }}
                    >
                      <label id={`${replyComposerId}-label`}>回复{replyTarget.author}</label>
                      <CommentNoteEditor
                        autoFocus
                        labelId={`${replyComposerId}-label`}
                        onChange={setReplyDraft}
                        placeholder="写下回复…"
                        value={replyDraft}
                      />
                      <div className="hn-comment-drawer__reply-actions">
                        <Button
                          ghost
                          onClick={() => {
                            setReplyDraft('');
                            replyTriggerRef.current?.focus();
                            setReplyTarget(null);
                          }}
                          size="small"
                        >
                          取消
                        </Button>
                        <Button
                          disabled={trimmedReplyDraft.length === 0}
                          size="small"
                          type="submit"
                          variant="primary"
                        >
                          发布回复
                        </Button>
                      </div>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <form className="hn-comment-drawer__composer" onSubmit={handleSubmit}>
        <label id={`${composerId}-label`}>添加评论</label>
        <CommentNoteEditor
          labelId={`${composerId}-label`}
          onChange={setDraft}
          placeholder="写下你的想法…"
          value={draft}
        />
        <div className="hn-comment-drawer__actions">
          <span>{trimmedDraft.length === 0 ? '输入评论后即可发布' : '评论将立即显示'}</span>
          <Button disabled={trimmedDraft.length === 0} type="submit" variant="primary">
            发布评论
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
