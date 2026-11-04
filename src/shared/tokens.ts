export const BUTTON_SIZES = {
  small: { height: 30, padding: 11, fontSize: 12 },
  medium: { height: 36, padding: 14, fontSize: 13 },
  large: { height: 42, padding: 18, fontSize: 14 },
} as const;
export const NUMERIC_TOKENS = {
  radius: { small: 6, medium: 8, large: 12 },
  spacing: { buttonGap: 8, fieldGap: 7, fieldPadding: 11, panelPadding: 12 },
  fontSize: { small: 12, medium: 13, large: 14 },
  layer: { popover: 1000, menu: 1000 },
} as const;
export const MODE_COLORS = {
  dark: {
    surface: '#111114',
    surfaceHover: '#17171b',
    text: '#f4f4f5',
    textMuted: '#92929d',
    border: 'rgba(255,255,255,0.1)',
    borderStrong: 'rgba(255,255,255,0.17)',
    danger: '#fb7185',
    dangerHover: '#fc8a9b',
    success: '#4ade80',
    warning: '#fbbf24',
    onDanger: '#09090b',
  },
  light: {
    surface: '#ffffff',
    surfaceHover: '#f4f4f6',
    text: '#18181b',
    textMuted: '#63636d',
    border: 'rgba(0,0,0,0.1)',
    borderStrong: 'rgba(0,0,0,0.18)',
    danger: '#e11d48',
    dangerHover: '#be123c',
    success: '#16a34a',
    warning: '#d97706',
    onDanger: '#ffffff',
  },
} as const;
