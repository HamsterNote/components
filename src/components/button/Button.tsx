import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'success' | 'info';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: ReactNode;
  readonly ghost?: boolean;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

export function Button({
  children,
  className,
  ghost = false,
  size = 'medium',
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  const resolvedVariant = variant === 'ghost' ? 'secondary' : variant;
  const resolvedGhost = ghost || variant === 'ghost';
  const classes = [
    'hn-button',
    `hn-button--${resolvedVariant}`,
    resolvedGhost && 'hn-button--ghost',
    `hn-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
