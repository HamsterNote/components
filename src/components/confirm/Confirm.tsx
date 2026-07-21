import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { Button } from '../button';
import { Dialog } from '../dialog';

// 确认按钮的语义色调：default 用 accent 主色，danger 用 --hn-color-danger 标记破坏性操作
export type ConfirmTone = 'default' | 'danger';

// Confirm 组件的 props：受控开合，使用方持有 open 状态
export interface ConfirmProps {
  // 受控开合状态
  readonly open: boolean;
  // 标题（必填）：确认场景必须有明确的动作描述
  readonly title: string;
  // 可选描述：解释确认的后果，给使用方更充分的决策依据
  readonly description?: string | undefined;
  // 确认按钮文案，默认「确认」
  readonly confirmText?: string | undefined;
  // 取消按钮文案，默认「取消」
  readonly cancelText?: string | undefined;
  // 语义色调：danger 把确认按钮渲染为 danger 色
  readonly tone?: ConfirmTone | undefined;
  // 加载中：禁用两个按钮并把确认按钮文案改为「处理中…」
  readonly loading?: boolean | undefined;
  // 确认回调：点击确认按钮时触发（loading=true 时禁用，不会触发）
  readonly onConfirm: () => void;
  // 取消回调：点击取消按钮 / Esc / 背景点击时触发
  readonly onCancel: () => void;
  // 是否允许 Esc 关闭（默认 true）；透传给底层 Dialog
  readonly closeOnEsc?: boolean | undefined;
  // 是否允许点击背景遮罩关闭（默认 true）；透传给底层 Dialog
  readonly closeOnBackdrop?: boolean | undefined;
}

// useConfirm() 返回的命令式 options：与 ConfirmProps 相比省略 open 与 onConfirm/onCancel，
// 由 hook 内部接管，确认/取消的结果通过 Promise<boolean> 返回给调用方
export type ConfirmOptions = Omit<ConfirmProps, 'open' | 'onConfirm' | 'onCancel' | 'loading'> & {
  // 可选 loading：命令式调用场景下使用方也可标记加载中
  readonly loading?: boolean;
};

// Provider 持有的内部状态：当前挂起的确认请求
interface PendingConfirm {
  readonly options: ConfirmOptions;
  readonly resolve: (value: boolean) => void;
}

// useConfirm() 返回的函数签名：传入 options，返回 Promise<boolean>
export type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

interface ConfirmContextValue {
  readonly confirm: ConfirmFunction;
}

// 用 Context 把 confirm 函数下发到 useConfirm() 调用点
const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// 确认对话框的展示核心：受控 Confirm 组件，复用 Dialog 表面 + 固定 footer 结构。
// 三种使用形式（组件、useConfirm hook、纯函数 confirm）都渲染这同一个核心，保证视觉一致。
export function Confirm({
  open,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  tone = 'default',
  loading = false,
  onConfirm,
  onCancel,
  closeOnEsc = true,
  closeOnBackdrop = true,
}: ConfirmProps) {
  // 关闭逻辑统一走 onCancel：Esc / 背景点击 / 取消按钮都触发它
  const handleClose = () => {
    onCancel();
  };

  return (
    <Dialog
      closeOnBackdrop={closeOnBackdrop}
      closeOnEsc={closeOnEsc}
      description={description}
      onClose={handleClose}
      open={open}
      title={title}
    >
      {/* footer：ghost 取消 + primary 确认，右对齐。
          data-tone 挂在 footer 上，CSS 据此覆盖确认按钮的背景色为 danger */}
      <div className="hn-confirm__footer" data-tone={tone}>
        <Button disabled={loading} onClick={handleClose} type="button" variant="ghost">
          {cancelText}
        </Button>
        <Button
          disabled={loading}
          onClick={() => {
            onConfirm();
          }}
          type="button"
          variant="primary"
        >
          {loading ? '处理中…' : confirmText}
        </Button>
      </div>
    </Dialog>
  );
}

// ConfirmProvider：在组件树顶层包裹一次，内部挂一个 Confirm 实例，
// useConfirm() 返回的 confirm(options) 会把请求塞进队列并返回 Promise。
//
// 并发策略：latest-wins（最新覆盖）。新请求到来时若已有挂起请求，先把旧请求 resolve(false)
// 视为被覆盖取消，再挂起新请求。这样 UI 上始终只展示最新一条确认框，调用方拿到
// false 也能正确感知到「我的请求没有真正被用户确认」。
export function ConfirmProvider({ children }: { readonly children: ReactNode }) {
  // 当前挂起的确认请求；null 表示无请求（Confirm 不展示）
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  // confirm 函数：稳定引用（useCallback 无依赖），返回 Promise<boolean>
  // 确认 → resolve(true)；取消/Esc/背景/被新请求覆盖 → resolve(false)
  const confirm = useCallback<ConfirmFunction>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending((current) => {
        // latest-wins：已有挂起请求时先把它 resolve(false)，避免 Promise 永久挂起
        if (current !== null) {
          current.resolve(false);
        }
        return { options, resolve };
      });
    });
  }, []);

  // 确认 / 取消后清空 pending，并通过 resolve 把结果回传给调用方
  const handleConfirm = () => {
    setPending((current) => {
      if (current !== null) {
        current.resolve(true);
      }
      return null;
    });
  };

  const handleCancel = () => {
    setPending((current) => {
      if (current !== null) {
        current.resolve(false);
      }
      return null;
    });
  };

  // 把 confirm 函数通过 Context 下发；useMemo 稳定 context 值，避免无谓重渲染
  const contextValue = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      {pending !== null ? (
        <Confirm
          closeOnBackdrop={pending.options.closeOnBackdrop}
          closeOnEsc={pending.options.closeOnEsc}
          confirmText={pending.options.confirmText}
          cancelText={pending.options.cancelText}
          description={pending.options.description}
          loading={pending.options.loading}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          open={true}
          title={pending.options.title}
          tone={pending.options.tone}
        />
      ) : null}
    </ConfirmContext.Provider>
  );
}

// useConfirm：在 ConfirmProvider 内部调用，返回 confirm(options) 函数。
// 在 Provider 外调用会抛错，避免静默失效（与 React Context 常见模式一致）
export function useConfirm(): ConfirmFunction {
  const context = useContext(ConfirmContext);
  if (context === null) {
    throw new Error(
      'useConfirm 必须在 <ConfirmProvider> 内部调用；在组件树顶层包裹 ConfirmProvider 后再使用。',
    );
  }
  return context.confirm;
}
