import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { Loading, type LoadingOptions, type LoadingSize } from './Loading';

// 命令式全屏 loading 单例 API：在组件树之外也能使用的全局加载指示器。
// 与 confirm.ts 同样的模式 —— 惰性创建容器 div + createRoot，SSR 守卫 + 卸载清理。
//
// 单例语义：全局同时至多存在一个 loading。重复调用 showLoading 不会创建第二个
// root / 容器，而是用新 options 重新渲染已有实例；hideLoading / showLoading 返回的
// hide 函数都会卸载清理同一个实例。

// 模块级单例状态：当前挂起的全屏 loading 实例（null 表示无）
interface LoadingInstance {
  readonly container: HTMLDivElement;
  readonly root: Root;
  // 当前渲染所用的 options，便于重复 showLoading 时对比是否需要重渲染
  text: string | undefined;
  size: LoadingSize | undefined;
}

let instance: LoadingInstance | null = null;

// SSR 守卫：typeof document === 'undefined' 时无法创建 DOM，打 warn 并 no-op。
// 与 confirm.ts 一致，避免服务端渲染时访问 document 抛错。
function ensureInstance(): LoadingInstance | null {
  if (typeof document === 'undefined') {
    console.warn(
      '[hamster-note/components] showLoading() 在非浏览器环境（无 document）下被调用，' +
        '已 no-op。请在客户端副作用中调用。',
    );
    return null;
  }

  // 已有实例：直接复用，不重复创建容器 / root
  if (instance !== null) {
    return instance;
  }

  // 惰性创建容器：挂在 body 末尾，避免干扰使用方 DOM；卸载时移除
  const container = document.createElement('div');
  document.body.appendChild(container);

  // React 19 的 createRoot：与 Demo main.tsx / confirm.ts 同源 API
  const root: Root = createRoot(container);

  instance = { container, root, text: undefined, size: undefined };
  return instance;
}

// 用当前 options 渲染 Loading 实例：把 <Loading> 套在 .hn-loading-overlay 容器内，
// 形成全屏遮罩 + 居中 spinner + text 的全屏 loading 形态。
function renderLoading(target: LoadingInstance, options: LoadingOptions | undefined) {
  const text = options?.text;
  const size = options?.size ?? 'medium';

  target.text = text;
  target.size = size;

  // 使用 createElement 而非 JSX，因为本文件是 .ts 而非 .tsx，不能用 JSX 语法。
  // 外层 .hn-loading-overlay 由 loading.css 提供全屏 fixed 遮罩样式；内部复用
  // <Loading> 的 spinner + text 渲染逻辑，保证视觉与内联 / cover 形态一致。
  // text 为 undefined 时不传给 <Loading>，让组件走「无文案」分支（exactOptionalPropertyTypes）。
  const loadingProps = text === undefined ? { size } : { size, text };

  target.root.render(
    createElement(
      'div',
      { className: 'hn-loading-overlay', role: 'status' },
      createElement(Loading, loadingProps),
    ),
  );
}

// 卸载清理：root.unmount() 后用 microtask 排队移除容器，与 confirm.ts 一致。
// unmount 是同步触发但内部清理可能延后一帧，用 microtask 避免在 React 内部异步
// 清理未完成时报错。
function cleanupInstance(target: LoadingInstance) {
  target.root.unmount();
  void Promise.resolve().then(() => {
    if (target.container.parentNode !== null) {
      target.container.parentNode.removeChild(target.container);
    }
  });
  instance = null;
}

// 显示全屏 loading。重复调用不会创建第二个实例，而是用新 options 重渲染已有实例
// （单例语义）。返回一个 hide 函数，调用后隐藏并清理当前 loading。
export function showLoading(options?: LoadingOptions): () => void {
  const target = ensureInstance();
  // SSR 场景：ensureInstance 已打 warn，这里返回一个 no-op hide 函数保持调用方代码形状一致
  if (target === null) {
    return () => {
      /* no-op: SSR 环境下无 loading 可隐藏 */
    };
  }

  renderLoading(target, options);

  // 返回的 hide 函数：关闭当前 loading。闭包捕获 target，即使后续 showLoading
  // 重渲染过，也只清理「调用 showLoading 时对应的那一个实例」（单例下始终同一个）。
  return () => {
    // 只有当实例仍是同一个时才清理：避免实例已被 hideLoading 清理后又新建了
    // 另一个实例时，旧 hide 函数误清新实例。
    if (instance === target) {
      cleanupInstance(target);
    }
  };
}

// 隐藏当前正在显示的全屏 loading（如果有）。与 showLoading 返回的 hide 函数等价，
// 提供一个无需持有 hide 引用也能关闭的入口。
export function hideLoading(): void {
  if (instance !== null) {
    cleanupInstance(instance);
  }
}
