import type { CSSProperties, ReactNode } from 'react';

import { isThemeAccentPreset, THEME_ACCENTS, type ThemeAccent, type ThemeMode } from './theme';

/**
 * ThemeProvider 的 props。
 */
export interface ThemeProviderProps {
  /**
   * 主题色 accent。两种来源：
   *  - 预设名（`violet` / `blue` / `teal` / `orange` / `pink`）：从
   *    THEME_ACCENTS 读取精确的 accent / accentHover / focusRing 三件套
   *    内联下发，保证与 TS 配置完全一致；
   *  - 任意 CSS 颜色字符串（如 `#ff8a3d` / `oklch(...)`）：只下发
   *    `--hn-color-accent`，hover 与 focusRing 由 theme.css 的
   *    `[data-accent='custom']` 规则用 color-mix 实时派生。
   *
   * 默认 `violet`，与 tokens.css 的默认值一致，不传时视觉无变化。
   *
   * 与 `mode` 正交：accent 影响 `--hn-color-accent` 三件套，mode 影响全套
   * 表面/文字/边框 token，两个轴独立组合。
   */
  readonly accent?: ThemeAccent;
  readonly children: ReactNode;
  /** 追加到根 div 的 className，便于使用方做布局或测试钩子。 */
  readonly className?: string;
  /**
   * 明暗模式：`'dark'`（默认）或 `'light'`。
   *
   * 始终写入根 div 的 `data-mode` 属性（即便用默认值），让 theme.css 的
   * `.hn-theme[data-mode='dark']` / `.hn-theme[data-mode='light']` 规则都能
   * 命中，保证嵌套场景下内层 Provider 的 mode 可以预测地覆盖外层（例如
   * light 内嵌套 dark 时，内层显式 data-mode='dark' 会强制把 token 拉回深色）。
   *
   * 与 `accent` 正交：mode 重定义 `--hn-color-surface` / `--hn-color-text` /
   * `--hn-color-border` 等全套表面与文字 token，accent 只影响 accent 三件套。
   * 两个轴在同一包裹层上共存（`data-mode` + `data-accent` + 内联 accent style）。
   *
   * 实际 token 覆盖值定义在 theme.css 中，ThemeProvider 只负责把 mode 透传到
   * `data-mode` 属性，CSS 级联完成其余工作。
   */
  readonly mode?: ThemeMode;
  /** 追加到根 div 的 style，合并时排在 ThemeProvider 内联 style 之后，可覆盖主题变量。 */
  readonly style?: CSSProperties;
}

/**
 * 根 div 的内联 style 类型。
 *
 * 既要满足 React 的 CSSProperties，又要允许写入三个主题相关的 CSS 自定义属性。
 * 用 `Partial<Record<...>>` 把三个自定义属性声明为可选的 string：
 *  - 预设色分支会下发全部三个；
 *  - 自定义色分支只下发主色，hover 与 focusRing 由 theme.css 的 color-mix 派生。
 *
 * 用 `Partial` 而非全必填，是为了让自定义分支的类型合法，避免 `as any`。
 * TS 对 CSSProperties 的索引签名不开放自定义属性，必须通过交叉类型扩展。
 */
type ThemeStyle = CSSProperties &
  Partial<Record<'--hn-color-accent' | '--hn-color-accent-hover' | '--hn-focus-ring', string>>;

/**
 * 根据入参 accent 推导出根 div 的 data-accent 属性值与内联 style。
 *
 * 预设色走精确下发：三件套全部从 THEME_ACCENTS 读取，保证 TS 配置是
 * 唯一数据源，运行时不会与配置漂移。
 *
 * 自定义色只下发主色：hover 与 focusRing 交给 theme.css 的
 * `[data-accent='custom']` 规则用 color-mix 派生，避免在这里手算颜色混合。
 */
function resolveAccentStyle(accent: ThemeAccent): {
  readonly dataAccent: string;
  readonly style: ThemeStyle;
} {
  if (isThemeAccentPreset(accent)) {
    const preset = THEME_ACCENTS[accent];
    return {
      dataAccent: accent,
      style: {
        '--hn-color-accent': preset.accent,
        '--hn-color-accent-hover': preset.accentHover,
        // 焦点环 = 3px 实线 + 颜色部分；颜色部分由预设给出（含 alpha）
        '--hn-focus-ring': `0 0 0 3px ${preset.focusRingColor}`,
      },
    };
  }
  // 自定义颜色：主色直接下发，派生值由 CSS 规则处理
  return {
    dataAccent: 'custom',
    style: {
      '--hn-color-accent': accent,
    },
  };
}

/**
 * 主题 Provider：包裹子树即可切换 accent 主色与明暗模式。
 *
 * 实现：渲染一个 `<div class="hn-theme" data-accent="..." data-mode="..." style="...">`
 * 包裹层，在内联 style 上重定义 `--hn-color-accent` / `--hn-color-accent-hover` /
 * `--hn-focus-ring` 三个 accent token，同时通过 `data-mode` 属性让 theme.css 的
 * `.hn-theme[data-mode='dark']` / `.hn-theme[data-mode='light']` 规则重定义全套
 * 表面与文字 token（surface/text/border 等）。由于 CSS 自定义属性天然经级联
 * 继承，子树所有组件无需任何改动即可吃到新主题 -- 这是本库「组件只引用全局
 * token、主题靠包裹层覆盖 token」哲学的直接应用（与 Popover 的 dark/light
 * 同范式）。
 *
 * 两个正交轴：
 *  - accent（主色）：影响 Button primary、TextField 焦点边框、NoteCard/Menu/
 *    Dialog/Drawer 焦点环、Loading 颜色等 accent 相关组件；
 *  - mode（明暗）：影响所有引用 surface/text/border token 的组件的背景与文字。
 *  两个轴独立组合，例如 `<ThemeProvider mode="light" accent="blue">`。
 *
 * `.hn-theme` 用 `display: contents` 让包裹 div 在盒模型上消失，不额外产生
 * 一层盒子、不打断外层 flex/grid 布局，因此不要在它上面设置背景/圆角等视觉样式
 * -- 页面级的 `background: var(--hn-color-surface)` 应由使用方在 app 根上应用。
 *
 * 支持嵌套：内层 ThemeProvider 经级联自然覆盖外层，最内层的 accent 与 mode 同时生效。
 * 例如：
 * ```tsx
 * <ThemeProvider mode="light" accent="blue">
 *   <ThemeProvider mode="dark" accent="teal">
 *     <Button variant="primary">我是 teal + 深色背景</Button>
 *   </ThemeProvider>
 *   <Button variant="primary">我是 blue + 浅色背景</Button>
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  accent = 'violet',
  children,
  className,
  mode = 'dark',
  style,
}: ThemeProviderProps) {
  const { dataAccent, style: accentStyle } = resolveAccentStyle(accent);
  // 合并类名：基础类 + 使用方 className，过滤 falsy 值（与 Button/Badge 一致）
  const classes = ['hn-theme', className].filter(Boolean).join(' ');
  // 合并 style：主题内联 style 在前，使用方 style 在后，允许使用方覆盖主题变量
  const mergedStyle: ThemeStyle = { ...accentStyle, ...style };

  // data-mode 始终渲染（即便用默认 'dark'），让 theme.css 的 [data-mode] 规则
  // 可预测命中，保证嵌套场景下内层 mode 能覆盖外层（light 内嵌套 dark 时强制回深色）
  return (
    <div className={classes} data-accent={dataAccent} data-mode={mode} style={mergedStyle}>
      {children}
    </div>
  );
}
