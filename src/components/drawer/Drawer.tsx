import {
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent,
  type Ref,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { useModal } from '../dialog/use-modal';
import { Icon } from '../icon/Icon';
import { useThemeScope } from '../theme/theme-context';

// 抽屉贴靠的屏幕边缘
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  // 受控开合状态：完全由使用方维护
  readonly open: boolean;
  // 关闭回调：Esc / 背景点击触发
  readonly onClose: () => void;
  // 贴靠边缘：默认 right（右侧抽屉是最常见用法）
  readonly placement?: DrawerPlacement;
  // 可选标题：传入后渲染 .hn-drawer__title 并通过 aria-labelledby 连接
  readonly title?: string | undefined;
  // 可选描述：传入后渲染 .hn-drawer__description 并通过 aria-describedby 连接
  readonly description?: string | undefined;
  // 自定义尺寸（px）：left/right 控制宽度，top/bottom 控制高度；不传用 CSS 默认值
  readonly size?: number | undefined;
  // 是否允许 Esc 关闭（默认 true）
  readonly closeOnEsc?: boolean | undefined;
  // 是否允许点击背景遮罩关闭（默认 true）
  readonly closeOnBackdrop?: boolean | undefined;
  // 是否展示右上角关闭按钮（默认 false）
  readonly showCloseButton?: boolean | undefined;
  // 是否展示标题左侧的全屏箭头按钮（默认 false）；标题拖动始终可切换双段状态
  readonly showFullscreenButton?: boolean | undefined;
  // React 19：ref 作为普通 prop 直接透传到面板根 div
  readonly ref?: Ref<HTMLDivElement>;
}

// 模态抽屉：受控 open / onClose，经 Portal 渲染到 document.body 下，贴边缘滑入。
// 焦点管理 / 滚动锁 / Esc / 背景点击 / 出入场动画共享自 useModal（与 Dialog 同源）。
export function Drawer({
  children,
  className,
  title,
  description,
  open,
  onClose,
  placement = 'right',
  size,
  closeOnEsc = true,
  closeOnBackdrop = true,
  showCloseButton = false,
  showFullscreenButton = false,
  ref,
  style,
  ...props
}: DrawerProps) {
  const [viewState, setViewState] = useState({ fullscreen: false, open });
  if (viewState.open !== open) {
    setViewState({ fullscreen: false, open });
  }
  const fullscreen = viewState.fullscreen;
  const dragStartYRef = useRef<number | null>(null);
  const theme = useThemeScope();
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

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const panelClasses = [
    'hn-drawer__panel',
    `hn-drawer__panel--${placement}`,
    fullscreen ? 'hn-drawer__panel--fullscreen' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // 尺寸通过 CSS 变量 --hn-drawer-size 注入，避免与使用方 style 冲突。
  // size 为数字时按 px 处理；不传时回退到 CSS 默认值（360px / 280px）
  type DrawerStyle = CSSProperties & Partial<Record<'--hn-drawer-size', string>>;
  const sizeStyle: DrawerStyle =
    size === undefined ? {} : { '--hn-drawer-size': `${String(size)}px` };
  const mergedStyle: DrawerStyle = { ...sizeStyle, ...style };

  const labelledBy = title === undefined ? undefined : titleId;
  const describedBy = description === undefined ? undefined : descriptionId;

  const handleHeaderPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest('button') !== null) {
      return;
    }
    dragStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleHeaderPointerEnd = (event: PointerEvent<HTMLElement>) => {
    const startY = dragStartYRef.current;
    dragStartYRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (startY === null) {
      return;
    }
    const deltaY = event.clientY - startY;
    if (deltaY <= -56) {
      setViewState((current) => ({ ...current, fullscreen: true }));
    } else if (deltaY >= 56) {
      setViewState((current) => ({ ...current, fullscreen: false }));
    }
  };

  // 合并使用方 ref 与 hook 内部 panelRef（焦点管理需要），沿用 Popover 的 setRefs 模式
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
      <div
        className="hn-drawer__backdrop"
        data-state={dataState}
        onPointerDown={handleBackdropPointerDown}
        ref={backdropRef}
      />
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
        style={mergedStyle}
        tabIndex={-1}
      >
        {title !== undefined ||
        description !== undefined ||
        showCloseButton ||
        showFullscreenButton ? (
          <header
            className="hn-drawer__header"
            onPointerCancel={handleHeaderPointerEnd}
            onPointerDown={handleHeaderPointerDown}
            onPointerUp={handleHeaderPointerEnd}
          >
            <div className="hn-drawer__heading">
              {showFullscreenButton ? (
                <button
                  aria-label={fullscreen ? '恢复自适应大小' : '全屏显示抽屉'}
                  aria-pressed={fullscreen}
                  className="hn-drawer__icon-button"
                  onClick={() => {
                    setViewState((current) => ({ ...current, fullscreen: !current.fullscreen }));
                  }}
                  type="button"
                >
                  <Icon aria-hidden="true" name={fullscreen ? 'arrow-down' : 'arrow-up'} />
                </button>
              ) : null}
              <div>
                {title !== undefined ? (
                  <h2 className="hn-drawer__title" id={titleId}>
                    {title}
                  </h2>
                ) : null}
                {description !== undefined ? (
                  <p className="hn-drawer__description" id={descriptionId}>
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
            {showCloseButton ? (
              <button
                aria-label="关闭抽屉"
                className="hn-drawer__icon-button"
                onClick={onClose}
                type="button"
              >
                <Icon aria-hidden="true" name="close" />
              </button>
            ) : null}
          </header>
        ) : null}
        <div className="hn-drawer__content">{children}</div>
      </div>
    </>
  );

  const surface =
    theme === null ? (
      modal
    ) : (
      <div
        className="hn-theme"
        data-accent={theme.accent}
        data-mode={theme.mode}
        style={theme.style}
      >
        {modal}
      </div>
    );

  return createPortal(surface, document.body);
}
