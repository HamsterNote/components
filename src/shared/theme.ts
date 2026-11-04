/**
 * 主题色配置（accent 主色）。
 *
 * 设计哲学：组件库所有组件只引用全局 token（见 tokens.css 的 :root），
 * 主题切换通过在包裹层重定义同名 token、经 CSS 级联让子树自动继承
 * （Popover 的 dark/light 即是这一范式）。本文件是 accent 主题色的
 * 唯一数据源：ThemeProvider 读取这里的预设值，内联下发到包裹 div 的
 * style 上，子树所有组件经 var(--hn-color-accent) 等拿到新色值。
 *
 * 预设色刻意避开既有语义色（danger #fb7185 / success #4ade80 /
 * warning #fbbf24），避免主题色与语义色产生视觉冲突。
 */

/**
 * 预设主题色表。
 *
 * 每个预设包含三个字段，分别对应 tokens.css 中被 accent 影响的三个 token：
 * - accent：主色，映射到 --hn-color-accent
 * - accentHover：hover 态色，映射到 --hn-color-accent-hover
 * - focusRingColor：焦点环颜色（不含 box-shadow 前缀，仅颜色部分），
 *   ThemeProvider 会拼成 `0 0 0 3px ${focusRingColor}` 写入 --hn-focus-ring
 *
 * `violet` 与 tokens.css 的默认值完全一致，作为 ThemeProvider 的默认预设，
 * 保证不传 accent 时视觉与未包裹 ThemeProvider 时完全等价（零 Breaking Change）。
 */
export const THEME_ACCENTS = {
  // 默认紫：与 tokens.css 现有默认值保持一致，包裹后视觉无变化
  violet: {
    accent: '#7c83ff',
    accentHover: '#9197ff',
    focusRingColor: 'rgb(145 151 255 / 42%)',
  },
  // 蓝：偏冷的专业感，hover 向白色提亮
  blue: {
    accent: '#60a5fa',
    accentHover: '#7db6fb',
    focusRingColor: 'rgb(96 165 250 / 42%)',
  },
  // 青绿：清新但与 success(#4ade80) 拉开足够距离
  teal: {
    accent: '#2dd4bf',
    accentHover: '#4fdcc9',
    focusRingColor: 'rgb(45 212 191 / 42%)',
  },
  // 橙：暖色强调，与 warning(#fbbf24) 同色系但饱和度更高
  orange: {
    accent: '#fb923c',
    accentHover: '#fca45c',
    focusRingColor: 'rgb(251 146 60 / 42%)',
  },
  // 粉：与 danger(#fb7185) 同色系但更柔，适合个性化场景
  pink: {
    accent: '#f472b6',
    accentHover: '#f68cc4',
    focusRingColor: 'rgb(244 114 182 / 42%)',
  },
} as const;

/**
 * 预设主题色名：`violet` | `blue` | `teal` | `orange` | `pink`。
 */
export type ThemeAccentPreset = keyof typeof THEME_ACCENTS;

/**
 * 主题色入参类型。
 *
 * 用 `ThemeAccentPreset | (string & {})` 的交叉技巧保留两个能力：
 * 1. 传入预设名时获得自动补全（IDE 列出五个预设）；
 * 2. 传入任意 CSS 颜色字符串时仍类型合法（`(string & {})` 让 TS 不会
 *    把 string 收窄成字面量联合，避免「自定义颜色」用法被类型拒绝）。
 */
export type ThemeAccent = ThemeAccentPreset | (string & {});

/**
 * 判断字符串是否是预设主题色名。
 *
 * 用于 Demo 或使用方在拿到一个 accent 字符串时区分「预设」与「自定义」
 * 两种来源：预设走 ThemeProvider 内联下发的精确派生值，自定义走
 * theme.css 中 `[data-accent='custom']` 的 color-mix 派生。
 */
export function isThemeAccentPreset(value: string): value is ThemeAccentPreset {
  return value in THEME_ACCENTS;
}

/**
 * 明暗模式。
 *
 * 与 accent 主题色正交：accent 重定义 `--hn-color-accent` 等 accent 三件套，
 * mode 重定义 `--hn-color-surface` / `--hn-color-text` / `--hn-color-border`
 * 等全套表面与文字 token。两个轴独立组合，例如可以同时「浅色背景 + 蓝色 accent」。
 *
 * - `dark`（默认）：与 tokens.css 的 :root 默认值一致，不传时视觉无变化；
 * - `light`：重定义全套表面/文字/边框 token 为浅色配色。
 *
 * 实际的 token 覆盖值定义在 theme.css 的 `.hn-theme[data-mode='light']` 与
 * `.hn-theme[data-mode='dark']` 规则中，ThemeProvider 只负责把 mode 写到
 * 根 div 的 `data-mode` 属性上，CSS 级联完成其余工作。
 */
export type ThemeMode = 'dark' | 'light';
