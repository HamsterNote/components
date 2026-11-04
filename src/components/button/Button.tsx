import { BUTTON_SIZES } from '../../shared/tokens';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'success' | 'info';
export type ButtonSize = keyof typeof BUTTON_SIZES;

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
  style,
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

  const dimensions = BUTTON_SIZES[size];
  const buttonStyle = {
    '--hn-button-min-height': `${String(dimensions.height)}px`,
    '--hn-button-padding': `${String(dimensions.padding)}px`,
    '--hn-button-font-size': `${String(dimensions.fontSize)}px`,
    ...style,
  } as CSSProperties;
  return (
    <button className={classes} type={type} {...props} style={buttonStyle}>
      {children}
    </button>
  );
}
