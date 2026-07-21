import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

export function Button({
  children,
  className,
  size = 'medium',
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  const classes = ['hn-button', `hn-button--${variant}`, `hn-button--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
