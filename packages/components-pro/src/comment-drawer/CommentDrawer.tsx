import { Drawer } from '@hamster-note/components/drawer';
import { useId, useRef, useState, type SyntheticEvent } from 'react';

import { CommentComposer, ReplyComposer } from './CommentComposers';
import { CommentAnnouncement, type CommentAnnouncementValue } from './CommentAnnouncement';
import { CommentDeleteConfirm } from './CommentDeleteConfirm';
import { CommentEntry, type ReplyTarget } from './CommentEntry';
import {
  type CommentData,
  type CommentDrawerProps,
  type CommentEntry as CommentEntryData,
  type CommentReplyData,
  type DeleteTarget,
  readComposerValue,
} from './comment-drawer-model';

export type {
  CommentData,
  CommentDrawerProps,
  CommentEntry,
  CommentReplyData,
} from './comment-drawer-model';

export function CommentDrawer({
  comments = [],
  currentAuthor = '你',
  data,
  onClose,
  onCommentAdd,
  onCommentDelete,
  onCommentEdit,
  onReplyAdd,
  onReplyDelete,
  onReplyEdit,
  open,
  title = '评论',
}: CommentDrawerProps) {
  const composerId = useId();
  const replyComposerId = useId();
  const replyTriggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState('');
  const [replyDraft, setReplyDraft] = useState('');
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [localComments, setLocalComments] = useState<readonly CommentData[]>([]);
  const [localReplies, setLocalReplies] = useState<
    Readonly<Partial<Record<string, readonly CommentReplyData[]>>>
  >({});
  const [commentEdits, setCommentEdits] = useState<Readonly<Record<string, string>>>({});
  const [replyEdits, setReplyEdits] = useState<
    Readonly<Partial<Record<string, Readonly<Record<string, string>>>>>
  >({});
  const [deletedCommentIds, setDeletedCommentIds] = useState<readonly string[]>([]);
  const [deletedReplyIds, setDeletedReplyIds] = useState<
    Readonly<Partial<Record<string, readonly string[]>>>
  >({});
  const [announcement, setAnnouncement] = useState<CommentAnnouncementValue>({
    id: 0,
    message: '',
  });
  const visibleComments = [...(data ?? comments), ...localComments].filter(
    (comment) => !deletedCommentIds.includes(comment.id),
  );

  function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const content = readComposerValue(event.currentTarget);
    if (content.length === 0) {
      return;
    }

    const comment: CommentEntryData = {
      id: `${composerId}-${(localComments.length + 1).toString()}`,
      author: currentAuthor,
      content,
      createdAt: new Date().toISOString(),
    };

    setLocalComments((current) => [...current, comment]);
    setDraft('');
    setAnnouncement((current) => ({ id: current.id + 1, message: '评论已发布。' }));
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
      ...(target.kind === 'reply' ? { replyTo: { id: target.id, author: target.author } } : {}),
    };

    setLocalReplies((current) => ({
      ...current,
      [target.commentId]: [...(current[target.commentId] ?? []), reply],
    }));
    setReplyDraft('');
    replyTriggerRef.current?.focus();
    setReplyTarget(null);
    setAnnouncement((current) => ({ id: current.id + 1, message: '回复已发布。' }));
    onReplyAdd?.(target.commentId, content, reply);
  }

  function toggleReplyComposer(target: ReplyTarget, trigger: HTMLButtonElement) {
    replyTriggerRef.current = trigger;
    setReplyDraft('');
    setReplyTarget((current) =>
      current?.kind === target.kind &&
      current.commentId === target.commentId &&
      current.id === target.id
        ? null
        : target,
    );
  }

  function handleDeleteConfirm() {
    if (deleteTarget === null) {
      return;
    }

    switch (deleteTarget.kind) {
      case 'comment':
        setDeletedCommentIds((current) => [...current, deleteTarget.commentId]);
        setAnnouncement((current) => ({ id: current.id + 1, message: '评论已删除。' }));
        onCommentDelete?.(deleteTarget.commentId);
        break;
      case 'reply':
        setDeletedReplyIds((current) => ({
          ...current,
          [deleteTarget.commentId]: [
            ...(current[deleteTarget.commentId] ?? []),
            deleteTarget.replyId,
          ],
        }));
        setAnnouncement((current) => ({ id: current.id + 1, message: '回复已删除。' }));
        onReplyDelete?.(deleteTarget.commentId, deleteTarget.replyId);
        break;
    }
    setDeleteTarget(null);
  }

  return (
    <Drawer
      className="hn-comment-drawer"
      description="查看讨论并添加新评论。"
      onClose={onClose}
      open={open}
      ref={drawerRef}
      showCloseButton
      size={400}
      title={title}
    >
      <div className="hn-comment-drawer__feed">
        {visibleComments.length === 0 ? (
          <p className="hn-comment-drawer__empty">还没有评论，开始这段讨论。</p>
        ) : (
          <ol className="hn-comment-drawer__list">
            {visibleComments.map((sourceComment) => {
              const comment = {
                ...sourceComment,
                content: commentEdits[sourceComment.id] ?? sourceComment.content,
              };
              const persistedReplies = comment.replies ?? [];
              const replies = [
                ...persistedReplies,
                ...(localReplies[comment.id] ?? []).filter(
                  (localReply) => !persistedReplies.some((reply) => reply.id === localReply.id),
                ),
              ]
                .filter((reply) => !deletedReplyIds[comment.id]?.includes(reply.id))
                .map((reply) => ({
                  ...reply,
                  content: replyEdits[comment.id]?.[reply.id] ?? reply.content,
                }));

              return (
                <CommentEntry
                  activeReplyTarget={replyTarget ?? undefined}
                  comment={comment}
                  key={comment.id}
                  onCommentDelete={
                    onCommentDelete === undefined
                      ? undefined
                      : (commentId) => {
                          setDeleteTarget({ kind: 'comment', commentId });
                        }
                  }
                  onCommentEdit={
                    onCommentEdit === undefined
                      ? undefined
                      : (commentId, content) => {
                          setCommentEdits((current) => ({ ...current, [commentId]: content }));
                          setAnnouncement((current) => ({
                            id: current.id + 1,
                            message: '评论已更新。',
                          }));
                          onCommentEdit(commentId, content);
                        }
                  }
                  onReplyDelete={
                    onReplyDelete === undefined
                      ? undefined
                      : (commentId, replyId) => {
                          setDeleteTarget({ kind: 'reply', commentId, replyId });
                        }
                  }
                  onReplyEdit={
                    onReplyEdit === undefined
                      ? undefined
                      : (commentId, replyId, content) => {
                          setReplyEdits((current) => ({
                            ...current,
                            [commentId]: { ...current[commentId], [replyId]: content },
                          }));
                          setAnnouncement((current) => ({
                            id: current.id + 1,
                            message: '回复已更新。',
                          }));
                          onReplyEdit(commentId, replyId, content);
                        }
                  }
                  onReplyRequest={toggleReplyComposer}
                  replies={replies}
                  replyComposer={
                    replyTarget?.commentId === comment.id ? (
                      <ReplyComposer
                        draft={replyDraft}
                        id={replyComposerId}
                        onCancel={() => {
                          setReplyDraft('');
                          replyTriggerRef.current?.focus();
                          setReplyTarget(null);
                        }}
                        onChange={setReplyDraft}
                        onSubmit={(event) => {
                          handleReplySubmit(event, replyTarget);
                        }}
                        target={replyTarget}
                      />
                    ) : undefined
                  }
                  replyComposerId={replyComposerId}
                />
              );
            })}
          </ol>
        )}
      </div>

      <CommentAnnouncement value={announcement} />

      <CommentComposer
        draft={draft}
        labelId={`${composerId}-label`}
        onChange={setDraft}
        onSubmit={handleSubmit}
      />
      <CommentDeleteConfirm
        finalFocusRef={drawerRef}
        onCancel={() => {
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        target={deleteTarget}
      />
    </Drawer>
  );
}
