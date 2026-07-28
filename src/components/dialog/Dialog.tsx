import { type HTMLAttributes, type Ref, useState } from 'react';
import { createPortal } from 'react-dom';

import { Icon } from '../icon/Icon';
import { useThemeScope } from '../theme/theme-context';
import { useModal } from './use-modal';

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  // 受控开合状态：完全由使用方维护，组件不内部维护 open
  readonly open: boolean;
  // 关闭回调：Esc / 背景点击触发时调用，由使用方决定是否真正 setOpen(false)
  readonly onClose: () => void;
  // 可选标题：传入后渲染 .hn-dialog__title 并通过 aria-labelledby 连接到面板
  readonly title?: string | undefined;
  // 可选描述：传入后渲染 .hn-dialog__description 并通过 aria-describedby 连接
  readonly description?: string | undefined;
  // 是否允许 Esc 关闭（默认 true）
  readonly closeOnEsc?: boolean | undefined;
  // 是否允许点击背景遮罩关闭（默认 true）
  readonly closeOnBackdrop?: boolean | undefined;
  // 是否展示右上角关闭按钮（默认 false）
  readonly showCloseButton?: boolean | undefined;
  // 是否展示关闭按钮左侧的全屏切换按钮（默认 false）
  readonly showFullscreenButton?: boolean | undefined;
  // React 19：ref 作为普通 prop 直接透传到面板根 div
  readonly ref?: Ref<HTMLDivElement>;
}

// 模态对话框：受控 open / onClose，经 Portal 渲染到 document.body 下。
// 焦点管理、滚动锁、Esc/背景点击关闭、出入场动画共享自 useModal hook。
export function Dialog({
  children,
  className,
  title,
  description,
  open,
  onClose,
  closeOnEsc = true,
  closeOnBackdrop = true,
  showCloseButton = false,
  showFullscreenButton = false,
  ref,
  style,
  ...props
}: DialogProps) {
  const [viewState, setViewState] = useState({ fullscreen: false, open });
  if (viewState.open !== open) {
    setViewState({ fullscreen: false, open });
  }
  const fullscreen = viewState.fullscreen;
  const theme = useThemeScope();
  // 解构 hook 返回值到局部变量：让 react-hooks 规则能识别每个值的类型，
  // 避免「访问 modal.xxx」被统一误判为「在渲染期访问 ref」。
  const {
    dataState,
    mounted,
    backdropRef,
    panelRef,
    titleId,
    descriptionId,
    handlePanelKeyDown,
    handleBackdropPointerDown,
  } = useModal({ open, onClose, closeOnEsc, closeOnBackdrop });

  // SSR 守卫：typeof document 检查避免服务端渲染时访问 document
  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const panelClasses = ['hn-dialog__panel', fullscreen ? 'hn-dialog__panel--fullscreen' : '', className]
    .filter(Boolean)
    .join(' ');

  // aria-labelledby / aria-describedby：仅在传入 title/description 时挂上，
  // 否则让使用方通过 aria-label 自行命名（与 Popover 哲学一致）
  const labelledBy = title === undefined ? undefined : titleId;
  const describedBy = description === undefined ? undefined : descriptionId;

  // 合并使用方 ref 与 hook 内部 panelRef（焦点管理需要）。
  // 沿用 Popover 的 setRefs 模式：对解构出来的 ref 直接赋 .current，react-hooks 规则允许。
  const setPanelRef = (element: HTMLDivElement | null) => {
    panelRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref !== undefined && ref !== null) {
      ref.current = element;
    }
  };

  const modal = (
    <>
      {/* 背景遮罩：承担点击外关闭与视觉聚焦，pointerdown 仅在 backdrop 自身才触发关闭 */}
      <div
        className="hn-dialog__backdrop"
        data-state={dataState}
        onPointerDown={handleBackdropPointerDown}
        ref={backdropRef}
      />
      {/* 面板：role=dialog + aria-modal=true，tabIndex=-1 让面板可被 .focus() 但不进 Tab 序列 */}
      <div
        {...props}
        aria-describedby={describedBy}
        aria-labelledby={labelledBy}
        aria-modal="true"
        className={panelClasses}
        data-state={dataState}
        onKeyDown={handlePanelKeyDown}
        ref={setPanelRef}
        role="dialog"
        style={style}
        tabIndex={-1}
      >
        {showCloseButton || showFullscreenButton ? (
          <div className="hn-dialog__actions">
            {showFullscreenButton ? (
              <button
                aria-label={fullscreen ? '退出全屏' : '全屏显示'}
                aria-pressed={fullscreen}
                className="hn-dialog__icon-button"
                onClick={() => {
                  setViewState((current) => ({ ...current, fullscreen: !current.fullscreen }));
                }}
                type="button"
              >
                <Icon aria-hidden="true" name={fullscreen ? 'zoom-out' : 'zoom-in'} />
              </button>
            ) : null}
            {showCloseButton ? (
              <button
                aria-label="关闭对话框"
                className="hn-dialog__icon-button"
                onClick={onClose}
                type="button"
              >
                <Icon aria-hidden="true" name="close" />
              </button>
            ) : null}
          </div>
        ) : null}
        {title !== undefined ? (
          <h2 className="hn-dialog__title" id={titleId}>
            {title}
          </h2>
        ) : null}
        {description !== undefined ? (
          <p className="hn-dialog__description" id={descriptionId}>
            {description}
          </p>
        ) : null}
        <div className="hn-dialog__content">{children}</div>
      </div>
    </>
  );

  const surface =
    theme === null ? (
      modal
    ) : (
      <div className="hn-theme" data-accent={theme.accent} data-mode={theme.mode} style={theme.style}>
        {modal}
      </div>
    );

  return createPortal(surface, document.body);
}
