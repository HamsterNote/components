import { createPortal } from 'react-dom';

export interface CommentAnnouncementValue {
  readonly id: number;
  readonly message: string;
}

export function CommentAnnouncement({ value }: { readonly value: CommentAnnouncementValue }) {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <p aria-atomic="true" aria-live="polite" className="hn-comment-drawer__status" role="status">
      <span key={value.id}>{value.message}</span>
    </p>,
    document.body,
  );
}
