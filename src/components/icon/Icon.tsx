import { createElement } from 'react';
import { ICON_GEOMETRY } from '../../shared/icons';
// filepath: /home/zhangxiao/frontend/HamsterNote/components/src/components/icon/Icon.tsx
import type { SVGProps } from 'react';
import type { IconName } from './icon-names';

/**
 * Icon 组件 -- 第一期 outline 风格图标集
 * ───────────────────────────────────────────────────────────────────────────
 * 设计规范（第一期统一遵循）：
 *   - viewBox 固定 24 × 24
 *   - stroke = "currentColor"，stroke-width = 1.5
 *   - stroke-linecap = "round"、stroke-linejoin = "round"
 *   - fill = "none"（纯描边 outline 风格）
 *   - 仅用 path / line / rect / circle / polyline 等基础图元，不依赖外部资源
 *   - 每个图标都在 24×24 的画布内留出约 1.5px 的视觉边距，避免被裁切
 *
 * 用法：
 *   <Icon name="file" />
 *   <Icon name="save" className="my-save" />
 *   <Icon name="delete" aria-label="删除" />
 *
 * 颜色：通过外层 color 控制（fill/stroke 都是 currentColor）；尺寸：通过外层
 * font-size 或 CSS width/height 控制（默认 1em 见方）。
 */

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** 图标名称，对应 IconName 联合类型 */
  readonly name: IconName;
  /** 可访问标签；传入后会渲染 aria-label，并将 svg 标记为 role="img" */
  readonly label?: string;
}

export function Icon({ label, name, className, ...props }: IconProps) {
  const classes = ['hn-icon', `hn-icon--${name}`, className].filter(Boolean).join(' ');
  // 传入 label 时 svg 视为可交互图像（role="img" + aria-label）；
  // 未传入时 aria-hidden 让屏幕阅读器跳过纯装饰图标。
  const accessibleProps =
    label === undefined
      ? { 'aria-hidden': true as const }
      : { 'aria-label': label, role: 'img' as const };

  return (
    <svg
      className={classes}
      fill="none"
      focusable="false"
      height="1em"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...accessibleProps}
      {...props}
    >
      <title>{label ?? name}</title>
      {ICON_GEOMETRY[name].map(({ tag, attrs }, index) =>
        createElement(tag, { ...attrs, key: index }),
      )}
    </svg>
  );
}
