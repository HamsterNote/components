import { type CSSProperties, createContext, useContext } from 'react';

import type { ThemeMode } from './theme';

export type ThemeStyle = CSSProperties &
  Partial<Record<'--hn-color-accent' | '--hn-color-accent-hover' | '--hn-focus-ring', string>>;

export interface ThemeScope {
  readonly accent: string;
  readonly mode: ThemeMode;
  readonly style: ThemeStyle;
}

export const ThemeContext = createContext<ThemeScope | null>(null);

// Portal 浮层会保留 React context，但会失去 DOM 祖先的 CSS 变量继承。
// Dialog / Drawer 通过此 hook 在 body 下重建同一主题作用域。
export function useThemeScope(): ThemeScope | null {
  return useContext(ThemeContext);
}
