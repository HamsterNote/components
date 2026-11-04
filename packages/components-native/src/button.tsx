import { Children, forwardRef, type ReactNode } from 'react';
import { Pressable, Text, type PressableProps, type View } from 'react-native';
import { BUTTON_SIZES } from '../../../src/shared/tokens';
import { useTheme } from './theme';
export type ButtonVariant =
  'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info' | 'ghost';
export type ButtonSize = keyof typeof BUTTON_SIZES;
export interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  ghost?: boolean;
}
export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    children,
    variant = 'secondary',
    size = 'medium',
    ghost = false,
    disabled,
    onPress,
    style,
    accessibilityState,
    ...props
  },
  ref,
) {
  const t = useTheme();
  const c = t.colors;
  const s = BUTTON_SIZES[size];
  const v = variant === 'ghost' ? 'secondary' : variant;
  const g = ghost || variant === 'ghost';
  const action = v === 'primary' ? c.accent : v === 'secondary' ? c.surface : c[v];
  const fg = g
    ? v === 'secondary'
      ? c.textMuted
      : action
    : v === 'secondary'
      ? c.text
      : v === 'danger'
        ? c.onDanger
        : c.onSemantic;
  return (
    <Pressable
      {...props}
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={(e) => {
        if (!disabled) onPress?.(e);
      }}
      style={(state) => [
        {
          minHeight: Math.max(44, s.height),
          minWidth: 44,
          paddingHorizontal: s.padding,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.spacing.buttonGap,
          borderWidth: 1,
          borderRadius: t.radius.medium,
          borderColor: !g && v === 'secondary' ? c.border : 'transparent',
          backgroundColor: g
            ? state.pressed
              ? c.surfaceHover
              : 'transparent'
            : state.pressed
              ? v === 'primary'
                ? c.accentHover
                : v === 'secondary'
                  ? c.surfaceHover
                  : action
              : action,
          opacity: disabled ? 0.42 : state.pressed ? 0.85 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {Children.map(children, (child) =>
        typeof child === 'string' || typeof child === 'number' ? (
          <Text
            style={{
              color: fg,
              fontSize:
                t.fontSize[size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium'],
              fontWeight: '600',
              flexShrink: 1,
            }}
          >
            {child}
          </Text>
        ) : (
          child
        ),
      )}
    </Pressable>
  );
});
