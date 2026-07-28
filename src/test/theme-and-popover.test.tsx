import { render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { describe, expect, it } from 'vitest';

import { Popover, PopoverSeparator, THEME_ACCENTS, ThemeProvider } from '../index';

describe('主题与浮层视觉契约', () => {
  it('Given 默认主题, When 渲染, Then 固定输出深色紫罗兰属性和三件套 token', () => {
    render(<ThemeProvider>内容</ThemeProvider>);

    const theme = screen.getByText('内容');
    expect(theme).toHaveClass('hn-theme');
    expect(theme).toHaveAttribute('data-mode', 'dark');
    expect(theme).toHaveAttribute('data-accent', 'violet');
    expect(theme).toHaveStyle({
      '--hn-color-accent': THEME_ACCENTS.violet.accent,
      '--hn-color-accent-hover': THEME_ACCENTS.violet.accentHover,
      '--hn-focus-ring': `0 0 0 3px ${THEME_ACCENTS.violet.focusRingColor}`,
    });
  });

  it('Given 自定义主题色和消费方 style, When 渲染, Then 标记 custom 且允许覆盖主色', () => {
    const overrideStyle: CSSProperties & Partial<Record<'--hn-color-accent', string>> = {
      '--hn-color-accent': '#123456',
    };
    render(
      <ThemeProvider accent="#ff8a3d" mode="light" style={overrideStyle}>
        内容
      </ThemeProvider>,
    );

    const theme = screen.getByText('内容');
    expect(theme).toHaveAttribute('data-mode', 'light');
    expect(theme).toHaveAttribute('data-accent', 'custom');
    expect(theme).toHaveStyle({ '--hn-color-accent': '#123456' });
    expect(theme.style.getPropertyValue('--hn-color-accent-hover')).toBe('');
  });

  it('Given 竖向浅色浮层, When 渲染, Then 方向、主题和分隔线语义匹配', () => {
    render(
      <Popover aria-label="工具" orientation="vertical" theme="light">
        <span>项目</span>
        <PopoverSeparator />
      </Popover>,
    );

    const popover = screen.getByLabelText('工具');
    expect(popover).toHaveClass('hn-popover');
    expect(popover).toHaveAttribute('data-theme', 'light');
    expect(popover).toHaveAttribute('data-orientation', 'vertical');
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('Given 右侧相对贴边浮层, When 渲染, Then 使用 absolute 居中并允许消费方覆盖', () => {
    render(
      <Popover edge="right" edgeOffset={24} relative style={{ top: '40%' }}>
        内容
      </Popover>,
    );

    const popover = screen.getByText('内容');
    expect(popover).toHaveStyle({
      position: 'absolute',
      right: '24px',
      top: '40%',
      transform: 'translateY(-50%)',
    });
  });

  it('Given 锚点元素, When 渲染浮层, Then 经 Portal 挂到 body 并启用 floating 类', () => {
    const anchor = document.createElement('button');
    document.body.appendChild(anchor);
    const host = document.createElement('div');
    document.body.appendChild(host);

    render(<Popover anchor={anchor}>锚定内容</Popover>, { container: host });

    const popover = screen.getByText('锚定内容');
    expect(popover).toHaveClass('hn-popover--floating');
    expect(popover.parentElement).toBe(document.body);
  });
});
