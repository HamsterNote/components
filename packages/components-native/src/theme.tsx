import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { THEME_ACCENTS, type ThemeAccentPreset, type ThemeMode } from '../../../src/shared/theme';
import { MODE_COLORS, NUMERIC_TOKENS } from '../../../src/shared/tokens';
export { THEME_ACCENTS, type ThemeAccentPreset, type ThemeMode } from '../../../src/shared/theme';
export { NUMERIC_TOKENS } from '../../../src/shared/tokens';

export interface AccentColors {
  accent: string;
  accentHover: string;
  focusRingColor: string;
}
export type NativeAccent = ThemeAccentPreset | `#${string}` | AccentColors;
type NumericTokens = {
  [K in keyof typeof NUMERIC_TOKENS]: { [P in keyof (typeof NUMERIC_TOKENS)[K]]: number };
};
export type TokenOverrides = { [K in keyof NumericTokens]?: Partial<NumericTokens[K]> };
export interface NativeTheme extends NumericTokens {
  mode: ThemeMode;
  colors: AccentColors & {
    surface: string;
    surfaceHover: string;
    text: string;
    textMuted: string;
    border: string;
    borderStrong: string;
    danger: string;
    dangerHover: string;
    success: string;
    warning: string;
    onDanger: string;
    info: string;
    onSemantic: string;
  };
}
export function resolveAccent(accent: NativeAccent): AccentColors {
  if (typeof accent === 'object') return accent;
  if (Object.hasOwn(THEME_ACCENTS, accent)) {
    const preset = THEME_ACCENTS[accent as ThemeAccentPreset];
    return {
      ...preset,
      focusRingColor: preset.focusRingColor.replace(
        /rgb\((\d+) (\d+) (\d+) \/ 42%\)/,
        'rgba($1,$2,$3,0.42)',
      ),
    };
  }
  if (!/^#[\da-f]{6}$/i.test(accent))
    throw new Error('Native accent must be a preset, #RRGGBB, or AccentColors.');
  const rgb = [1, 3, 5].map((i) => parseInt(accent.slice(i, i + 2), 16));
  return {
    accent,
    accentHover:
      '#' +
      rgb
        .map((v) =>
          Math.round(v * 0.84 + 255 * 0.16)
            .toString(16)
            .padStart(2, '0'),
        )
        .join(''),
    focusRingColor: `rgba(${rgb.join(',')},0.42)`,
  };
}
export function createTheme(
  mode: ThemeMode = 'dark',
  accent: NativeAccent = 'violet',
  tokens: TokenOverrides = {},
): NativeTheme {
  return {
    mode,
    colors: {
      ...MODE_COLORS[mode],
      info: '#aeb2ff',
      onSemantic: '#09090b',
      ...resolveAccent(accent),
    },
    radius: { ...NUMERIC_TOKENS.radius, ...tokens.radius },
    spacing: { ...NUMERIC_TOKENS.spacing, ...tokens.spacing },
    fontSize: { ...NUMERIC_TOKENS.fontSize, ...tokens.fontSize },
    layer: { ...NUMERIC_TOKENS.layer, ...tokens.layer },
  };
}
const ThemeContext = createContext<NativeTheme>(createTheme());
export interface ThemeProviderProps {
  children: ReactNode;
  mode?: ThemeMode;
  accent?: NativeAccent;
  tokens?: TokenOverrides;
  theme?: NativeTheme;
}
export function ThemeProvider({
  children,
  mode = 'dark',
  accent = 'violet',
  tokens,
  theme,
}: ThemeProviderProps) {
  const value = useMemo(
    () => theme ?? createTheme(mode, accent, tokens),
    [theme, mode, accent, tokens],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  return useContext(ThemeContext);
}
