import { useState } from 'react';

import {
  Badge,
  Button,
  Loading,
  TextField,
  THEME_ACCENTS,
  type ThemeAccentPreset,
  type ThemeMode,
  ThemeProvider,
} from '../index';

interface ThemeDemoProps {
  readonly mode: ThemeMode;
  readonly onFeedback: (message: string) => void;
}

// 预设主题色列表，按固定顺序展示
const presetAccents: readonly ThemeAccentPreset[] = ['violet', 'blue', 'teal', 'orange', 'pink'];

// 预设主题色的中文展示名，便于 Demo 阅读
const presetLabels: Record<ThemeAccentPreset, string> = {
  violet: 'Violet / 默认紫',
  blue: 'Blue / 蓝',
  teal: 'Teal / 青绿',
  orange: 'Orange / 橙',
  pink: 'Pink / 粉',
};

// 明暗模式选项，按固定顺序展示（与 accent 正交）
const themeModes: readonly ThemeMode[] = ['dark', 'light'];

// 明暗模式的中文展示名
const themeModeLabels: Record<ThemeMode, string> = {
  dark: 'Dark / 深色',
  light: 'Light / 浅色',
};

// 自定义色示例的初始值
const initialCustomColor = '#ff8a3d';

export function ThemeDemo({ mode: globalMode, onFeedback }: ThemeDemoProps) {
  const [customColor, setCustomColor] = useState(initialCustomColor);
  const [previewMode, setPreviewMode] = useState<ThemeMode>('dark');

  return (
    <div className="theme-grid">
      {/* 预设主题色：每个 ThemeProvider 包裹一组组件，展示 accent 对各组件的统一影响 */}
      {presetAccents.map((preset) => (
        <ThemeProvider accent={preset} key={preset} mode={globalMode}>
          <div className="theme-card">
            <div className="theme-card__header">
              <span className="theme-card__name">{presetLabels[preset]}</span>
              <code className="theme-card__value">{THEME_ACCENTS[preset].accent}</code>
            </div>
            <div className="theme-card__body">
              <Button
                onClick={() => {
                  onFeedback(`已切换到 ${presetLabels[preset]} 主题`);
                }}
                size="small"
                variant="primary"
              >
                主操作
              </Button>
              <Badge tone="accent">accent</Badge>
              <Loading size="small" />
            </div>
          </div>
        </ThemeProvider>
      ))}

      {/* 明暗模式：分段切换 dark/light，预览区消费 surface/text/border token；accent 与 mode 正交，同层共存 */}
      <div className="theme-card theme-card--mode">
        <div className="theme-card__header">
          <span className="theme-card__name">Mode / 明暗模式</span>
          <fieldset className="theme-mode-toggle" aria-label="明暗模式切换">
            {themeModes.map((m) => (
              <button
                aria-pressed={previewMode === m}
                className={`theme-mode-toggle__btn${previewMode === m ? ' is-active' : ''}`}
                key={m}
                onClick={() => {
                  setPreviewMode(m);
                }}
                type="button"
              >
                {themeModeLabels[m]}
              </button>
            ))}
          </fieldset>
        </div>
        {/* 预览区：accent=blue 与 mode 共存于同一 ThemeProvider，验证两轴正交 */}
        <ThemeProvider accent="blue" mode={previewMode}>
          <div className="theme-mode-preview">
            <p className="theme-mode-preview__text">
              表面 / 文字 / 边框 token 随模式翻转，accent 保持 blue（两轴正交）。
            </p>
            <p className="theme-mode-preview__muted">
              这是 muted 文字，观察 --hn-color-text-muted 随模式变化。
            </p>
            <div className="theme-mode-preview__actions">
              <Button
                onClick={() => {
                  onFeedback(`Mode 演示：当前 ${themeModeLabels[previewMode]}`);
                }}
                size="small"
                variant="primary"
              >
                主操作
              </Button>
              <Badge tone="accent">accent</Badge>
            </div>
          </div>
        </ThemeProvider>
      </div>

      {/* 自定义颜色：输入任意 CSS 颜色，hover 与 focusRing 由 CSS color-mix 派生 */}
      <div className="theme-card theme-card--custom">
        <div className="theme-card__header">
          <span className="theme-card__name">Custom / 自定义</span>
          <label className="theme-card__picker">
            <input
              onChange={(event) => {
                setCustomColor(event.currentTarget.value);
              }}
              type="color"
              value={customColor}
            />
            <code className="theme-card__value">{customColor}</code>
          </label>
        </div>
        <ThemeProvider accent={customColor} mode={globalMode}>
          <div className="theme-card__body">
            <Button
              onClick={() => {
                onFeedback(`已切换到自定义主题 ${customColor}`);
              }}
              size="small"
              variant="primary"
            >
              主操作
            </Button>
            <Badge tone="accent">accent</Badge>
            <Loading size="small" />
          </div>
        </ThemeProvider>
      </div>

      {/* 焦点环演示：TextField 聚焦时边框与焦点环都用 accent 色 */}
      <div className="theme-card theme-card--focus">
        <div className="theme-card__header">
          <span className="theme-card__name">Focus Ring / 焦点环</span>
          <p>聚焦输入框，观察边框与焦点环颜色随主题变化。</p>
        </div>
        <div className="theme-card__body theme-card__body--fields">
          <ThemeProvider accent="blue" mode={globalMode}>
            <TextField label="蓝色主题" placeholder="聚焦查看焦点环" />
          </ThemeProvider>
          <ThemeProvider accent="pink" mode={globalMode}>
            <TextField label="粉色主题" placeholder="聚焦查看焦点环" />
          </ThemeProvider>
        </div>
      </div>

      {/* 嵌套演示：内层 ThemeProvider 经级联覆盖外层 */}
      <div className="theme-card theme-card--nested">
        <div className="theme-card__header">
          <span className="theme-card__name">Nested / 嵌套覆盖</span>
          <p>内层 ThemeProvider 经级联覆盖外层，最内层的 accent 生效。</p>
        </div>
        <ThemeProvider accent="orange" mode={globalMode}>
          <div className="theme-card__body theme-card__body--nested">
            <Button
              onClick={() => {
                onFeedback('外层 orange 主题按钮');
              }}
              size="small"
              variant="primary"
            >
              外层 orange
            </Button>
            <ThemeProvider accent="teal" mode={globalMode}>
              <Button
                onClick={() => {
                  onFeedback('内层 teal 主题按钮');
                }}
                size="small"
                variant="primary"
              >
                内层 teal
              </Button>
            </ThemeProvider>
          </div>
        </ThemeProvider>
      </div>
    </div>
  );
}
