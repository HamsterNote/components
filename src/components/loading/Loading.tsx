import type { HTMLAttributes, ReactNode } from 'react';

// 加载指示器的三种尺寸：与 Button 的 small / medium / large 保持一致语义
export type LoadingSize = 'small' | 'medium' | 'large';

// 命令式单例 API（loading.ts 的 showLoading）所用的 options：只暴露 text 与 size，
// 不暴露 cover（全屏形态固定 cover 语义）也不暴露 className / 任意 div 属性，
// 保持命令式 API 的输入面最小化，与 confirm.ts 的 ConfirmOptions 同样的取舍思路。
export interface LoadingOptions {
  readonly text?: string | undefined;
  readonly size?: LoadingSize | undefined;
}

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  // 尺寸：small / medium / large，默认 medium
  readonly size?: LoadingSize | undefined;
  // 可选提示文案：渲染在 spinner 旁边 / 下方，用于向用户说明正在做什么
  readonly text?: string | undefined;
  // 是否作为覆盖层渲染：true 时绝对定位铺满最近 positioned 祖先（父级需 position: relative），
  // 配合半透明遮罩居中展示 spinner + text；false 时为内联 spinner
  readonly cover?: boolean | undefined;
}

// 内联 SVG spinner：遵循 Icon 组件的约定（stroke=currentColor、stroke-linecap=round、
// fill=none、无外部资源）。用一个 circle 配合 stroke-dasharray / stroke-dashoffset
// 渲染一段弧，再通过 CSS keyframe 旋转整个 svg 来产生「正在加载」的视觉。
//
// 颜色完全跟随 currentColor，因此使用方可通过外层 color / CSS 变量 --hn-color-accent
// 来控制 spinner 颜色，与本库其它组件「复用全局 token」的哲学一致。
function Spinner({ size }: { readonly size: LoadingSize }) {
  // 不同尺寸对应不同的 svg 画布与 stroke 宽度，保证视觉比例稳定
  const dimension = size === 'small' ? 16 : size === 'large' ? 28 : 20;
  const strokeWidth = size === 'small' ? 2 : size === 'large' ? 3 : 2.5;
  // 半径取画布半径减去 stroke 一半，避免弧线被裁切；周长 = 2πr
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 只画约 70% 的弧（留出缺口），通过 dashoffset 控制起点
  const arcLength = circumference * 0.7;
  // 字符串化数值：restrict-template-expressions 不允许 number 直接进模板字符串
  const dimensionStr = dimension.toString();
  const viewBox = `0 0 ${dimensionStr} ${dimensionStr}`;

  return (
    <svg
      aria-hidden="true"
      className="hn-loading__spinner"
      fill="none"
      focusable="false"
      height={dimension}
      viewBox={viewBox}
      width={dimension}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx={dimension / 2}
        cy={dimension / 2}
        r={radius}
        stroke="currentColor"
        strokeDasharray={`${arcLength.toString()} ${circumference.toString()}`}
        strokeDashoffset={(circumference * 0.25).toString()}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

// Loading 组件：支持三种使用形态 ——
// 1. 内联 spinner（cover=false，默认）：display:inline-flex，可带 text；
// 2. 局部覆盖 spinner（cover=true）：绝对定位铺满最近 positioned 祖先，带半透明遮罩；
// 3. 全屏单例 spinner：由 loading.ts 的 showLoading / hideLoading 命令式 API 驱动，
//    渲染 .hn-loading-overlay 全屏遮罩，内部复用本组件的 spinner + text。
//
// 本组件只负责「内联」与「局部覆盖」两种形态；全屏形态的容器样式由 .hn-loading-overlay
// 承担，loading.ts 会把 <Loading> 套在 .hn-loading-overlay 内部渲染。
export function Loading({
  size = 'medium',
  text,
  cover = false,
  className,
  children,
  ...props
}: LoadingProps) {
  // 类名合并方式与 Badge 一致：基础类 + 尺寸修饰 + cover 修饰 + 使用方 className
  const classes = [
    'hn-loading',
    `hn-loading--${size}`,
    cover ? 'hn-loading--cover' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // 无障碍命名：优先使用 text，否则用默认「加载中」；role=status 让屏幕阅读器播报
  const ariaLabel = text ?? '加载中';

  // text 与 children 二选一展示在 spinner 旁边：text 优先（更常用），children 留给
  // 使用方需要自定义提示内容结构的场景。两者都未传时只渲染 spinner。
  const hint: ReactNode = text ?? children;

  return (
    <div {...props} aria-label={ariaLabel} className={classes} role="status">
      <Spinner size={size} />
      {hint !== undefined ? <span className="hn-loading__text">{hint}</span> : null}
    </div>
  );
}
