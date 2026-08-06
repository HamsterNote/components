import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly children: ReactNode;
  readonly tone?: BadgeTone;
}

export function Badge({ children, className, tone = 'neutral', ...props }: BadgeProps) {
  const classes = ['hn-badge', `hn-badge--${tone}`, className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
