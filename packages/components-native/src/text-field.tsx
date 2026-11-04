import { forwardRef, useEffect, useId } from 'react';
import {
  AccessibilityInfo,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from './theme';
export interface TextFieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    hint,
    error,
    disabled,
    containerStyle,
    style,
    accessibilityLabel,
    accessibilityHint,
    editable,
    ...props
  },
  ref,
) {
  const t = useTheme();
  const id = useId();
  useEffect(() => {
    if (error) AccessibilityInfo.announceForAccessibility(error);
  }, [error]);
  return (
    <View style={[{ gap: t.spacing.fieldGap, alignSelf: 'stretch' }, containerStyle]}>
      <Text
        nativeID={id}
        style={{ color: t.colors.text, fontSize: t.fontSize.small, fontWeight: '600' }}
      >
        {label}
      </Text>
      <TextInput
        {...props}
        ref={ref}
        editable={disabled ? false : editable}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error || accessibilityHint || hint}
        accessibilityState={{
          ...props.accessibilityState,
          disabled: Boolean(disabled || editable === false),
        }}
        placeholderTextColor={t.colors.textMuted}
        style={[
          {
            minHeight: 44,
            color: t.colors.text,
            backgroundColor: t.colors.surface,
            borderWidth: 1,
            borderColor: error ? t.colors.danger : t.colors.border,
            borderRadius: t.radius.medium,
            padding: t.spacing.fieldPadding,
            fontSize: t.fontSize.large,
            opacity: disabled ? 0.48 : 1,
          },
          style,
        ]}
      />
      {error || hint ? (
        <Text
          accessibilityLiveRegion={error ? 'polite' : 'none'}
          style={{
            color: error ? t.colors.danger : t.colors.textMuted,
            fontSize: t.fontSize.small,
          }}
        >
          {error || hint}
        </Text>
      ) : null}
    </View>
  );
});
