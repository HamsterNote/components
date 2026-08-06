import type { HTMLAttributes, MouseEventHandler } from 'react';

interface NoteCardContentProps {
  readonly excerpt: string;
  readonly meta: string;
  readonly title: string;
}

export interface NoteCardProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick' | 'title'> {
  readonly excerpt: string;
  readonly meta: string;
  readonly onClick?: MouseEventHandler<HTMLButtonElement>;
  readonly selected?: boolean;
  readonly title: string;
}

function NoteCardContent({ excerpt, meta, title }: NoteCardContentProps) {
  return (
    <>
      <div className="hn-note-card__heading">
        <h3 className="hn-note-card__title">{title}</h3>
        <p className="hn-note-card__excerpt">{excerpt}</p>
      </div>
      <p className="hn-note-card__meta">{meta}</p>
    </>
  );
}

export function NoteCard({
  className,
  excerpt,
  meta,
  onClick,
  selected = false,
  title,
  ...props
}: NoteCardProps) {
  const classes = ['hn-note-card', selected ? 'hn-note-card--selected' : undefined, className]
    .filter(Boolean)
    .join(' ');

  if (onClick !== undefined) {
    return (
      <article className={`${classes} hn-note-card--interactive`} {...props}>
        <button
          aria-label={title}
          aria-pressed={selected}
          className="hn-note-card__action"
          onClick={onClick}
          type="button"
        />
        <NoteCardContent excerpt={excerpt} meta={meta} title={title} />
      </article>
    );
  }

  return (
    <article className={classes} {...props}>
      <NoteCardContent excerpt={excerpt} meta={meta} title={title} />
    </article>
  );
}
