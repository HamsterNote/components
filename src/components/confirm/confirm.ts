import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { Confirm, type ConfirmOptions } from './Confirm';

// 纯函数 confirm：在 ConfirmProvider 树之外也能使用的命令式 API。
// 内部惰性创建一个容器 div + React Root，渲染一个 Confirm 实例，
// 用户确认/取消后 resolve Promise 并卸载清理。
//
// SSR 守卫：typeof document === 'undefined' 时无法创建 DOM，resolve(false) 并打 warn，
// 让使用方在服务端调用时拿到稳定的 false 而不是抛错或永久挂起。
export function confirm(options: ConfirmOptions): Promise<boolean> {
  // SSR 场景：无 document，无法渲染，resolve false 并打 warn 提示使用方
  if (typeof document === 'undefined') {
    console.warn(
      '[hamster-note/components] confirm() 在非浏览器环境（无 document）下被调用，' +
        '已直接 resolve(false)。请在客户端副作用中调用，或改用 <Confirm> 组件 / useConfirm() hook。',
    );
    return Promise.resolve(false);
  }

  // 容器：挂在 body 末尾，避免干扰使用方 DOM；卸载时移除
  const container = document.createElement('div');
  document.body.appendChild(container);

  // React 19 的 createRoot：与 Demo main.tsx 同源 API
  const root: Root = createRoot(container);

  // 卸载清理：root.unmount() 后等待一帧再移除容器，避免 React 内部异步清理未完成时报错
  const cleanup = () => {
    root.unmount();
    // unmount 是同步触发但内部清理可能延后一帧，用 microtask 排队移除容器
    void Promise.resolve().then(() => {
      if (container.parentNode !== null) {
        container.parentNode.removeChild(container);
      }
    });
  };

  // 用 Promise 包装：渲染 Confirm 并把 onConfirm/onCancel 接到 resolve
  return new Promise<boolean>((resolve) => {
    const handleSettle = (result: boolean) => {
      resolve(result);
      // resolve 后再清理 DOM，避免在 Confirm 还在做退场动画时就被卸载
      // 这里同步清理：Promise 已 resolve，调用方拿到结果后不再依赖 UI
      cleanup();
    };

    // 渲染：open=true 常驻，onConfirm/onCancel 触发后 resolve 并卸载
    // 使用 createElement 而非 JSX，因为本文件是 .ts 而非 .tsx，不能用 JSX 语法
    root.render(
      createElement(Confirm, {
        open: true,
        title: options.title,
        description: options.description,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        tone: options.tone,
        loading: options.loading,
        closeOnEsc: options.closeOnEsc,
        closeOnBackdrop: options.closeOnBackdrop,
        onConfirm: () => {
          handleSettle(true);
        },
        onCancel: () => {
          handleSettle(false);
        },
      }),
    );
  });
}

// 别名：某些场景下 confirm 名字与业务代码中的 confirm 全局函数或变量冲突，
// 提供 confirmDialog 作为更明确的替代名，行为完全一致
export { confirm as confirmDialog };
