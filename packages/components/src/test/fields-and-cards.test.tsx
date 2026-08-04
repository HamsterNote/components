import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NoteCard, TextField } from '../index';

describe('输入与内容组件契约', () => {
  it('Given 标签和提示, When 渲染文本框, Then 标签、输入和提示通过 id 关联', () => {
    render(<TextField hint="至少三个字符" id="note-title" label="笔记标题" />);

    const input = screen.getByRole('textbox', { name: '笔记标题' });
    expect(input).toHaveAttribute('id', 'note-title');
    expect(input).toHaveAttribute('aria-describedby', 'note-title-message');
    expect(screen.getByText('至少三个字符')).toHaveAttribute('id', 'note-title-message');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('Given 同时存在提示和错误, When 渲染, Then 错误优先且保留外部描述关系', () => {
    render(
      <TextField
        aria-describedby="external-help"
        error="标题太短"
        hint="至少三个字符"
        id="note-title"
        label="笔记标题"
      />,
    );

    const input = screen.getByRole('textbox', { name: '笔记标题' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'external-help note-title-message');
    expect(input.parentElement).toHaveClass('hn-text-field--invalid');
    expect(screen.getByText('标题太短')).toBeInTheDocument();
    expect(screen.queryByText('至少三个字符')).not.toBeInTheDocument();
  });

  it('Given 静态笔记卡, When 渲染, Then 保持 article 语义且不伪造按钮', () => {
    render(<NoteCard excerpt="摘要" meta="刚刚更新" title="季度规划" />);

    const article = screen.getByRole('article');
    expect(article).toHaveClass('hn-note-card');
    expect(article).not.toHaveClass('hn-note-card--interactive');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('Given 已选中的交互卡, When 点击覆盖按钮, Then 回调和选中语义保持稳定', () => {
    const onClick = vi.fn();
    render(<NoteCard excerpt="摘要" meta="刚刚更新" onClick={onClick} selected title="季度规划" />);

    const action = screen.getByRole('button', { name: '季度规划' });
    fireEvent.click(action);

    expect(screen.getByRole('article')).toHaveClass(
      'hn-note-card--interactive',
      'hn-note-card--selected',
    );
    expect(action).toHaveAttribute('aria-pressed', 'true');
    expect(onClick).toHaveBeenCalledOnce();
  });
});
