import { useState } from 'react';

import { Button, Confirm, ConfirmProvider, confirm, useConfirm, type ConfirmTone } from '../index';
import { DemoCode } from './DemoCode';

interface ConfirmDemoProps {
  readonly onFeedback: (message: string) => void;
}

const componentExampleCode = `const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>删除</Button>
<Confirm
  open={open}
  title="删除笔记？"
  description="删除后无法恢复，该操作不可撤销。"
  tone="danger"
  confirmText="删除"
  onConfirm={() => {
    setOpen(false);
    // 执行删除
  }}
  onCancel={() => setOpen(false)}
/>`;

const hookExampleCode = `// 顶层包裹一次
<ConfirmProvider>
  <App />
</ConfirmProvider>

// 任意子组件内
const confirm = useConfirm();

const ok = await confirm({
  title: '保存修改？',
  description: '未保存的改动将丢失。',
  confirmText: '保存',
});
if (ok) {
  // 用户确认
}`;

const pureExampleCode = `import { confirm } from '@hamster-note/components';

const ok = await confirm({
  title: '退出登录？',
  description: '需要重新登录后才能继续操作。',
  confirmText: '退出',
  tone: 'danger',
});
if (ok) {
  // 用户确认退出
}`;

// 受控组件示例：使用方持有 open 状态
function ComponentForm({ onFeedback }: { readonly onFeedback: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<ConfirmTone>('danger');

  return (
    <>
      <div className="confirm-demo-actions">
        <Button
          onClick={() => {
            setTone('default');
            setOpen(true);
          }}
          size="small"
        >
          保存（default）
        </Button>
        <Button
          onClick={() => {
            setTone('danger');
            setOpen(true);
          }}
          size="small"
        >
          删除（danger）
        </Button>
      </div>
      <Confirm
        confirmText={tone === 'danger' ? '删除' : '保存'}
        description={
          tone === 'danger' ? '删除后无法恢复，该操作不可撤销。' : '确认保存当前笔记的所有改动？'
        }
        onCancel={() => {
          setOpen(false);
          onFeedback('组件模式：已取消');
        }}
        onConfirm={() => {
          setOpen(false);
          onFeedback(`组件模式：已${tone === 'danger' ? '删除' : '保存'}`);
        }}
        open={open}
        title={tone === 'danger' ? '删除笔记？' : '保存修改？'}
        tone={tone}
      />
    </>
  );
}

// hook 示例：在 ConfirmProvider 内部使用 useConfirm()
function HookForm({ onFeedback }: { readonly onFeedback: (message: string) => void }) {
  const confirmFn = useConfirm();

  // 用 void 包裹 async 调用：onClick 期望 void 返回，避免 no-misused-promises 报错
  const handleSave = () => {
    void (async () => {
      const ok = await confirmFn({
        title: '保存修改？',
        description: '未保存的改动将丢失。',
        confirmText: '保存',
      });
      onFeedback(`hook 模式：${ok ? '已确认保存' : '已取消'}`);
    })();
  };

  const handleLogout = () => {
    void (async () => {
      const ok = await confirmFn({
        title: '退出登录？',
        description: '需要重新登录后才能继续操作。',
        confirmText: '退出',
        tone: 'danger',
      });
      onFeedback(`hook 模式：${ok ? '已确认退出' : '已取消'}`);
    })();
  };

  return (
    <div className="confirm-demo-actions">
      <Button onClick={handleSave} size="small">
        保存（hook）
      </Button>
      <Button onClick={handleLogout} size="small">
        退出（hook danger）
      </Button>
    </div>
  );
}

// 纯函数示例：直接调用 confirm()，无需 Provider
function PureForm({ onFeedback }: { readonly onFeedback: (message: string) => void }) {
  const handlePublish = () => {
    void (async () => {
      const ok = await confirm({
        title: '发布笔记？',
        description: '发布后所有协作者可见。',
        confirmText: '发布',
      });
      onFeedback(`纯函数模式：${ok ? '已发布' : '已取消'}`);
    })();
  };

  const handleEmpty = () => {
    void (async () => {
      const ok = await confirm({
        title: '清空回收站？',
        description: '回收站中的所有笔记将被永久删除，不可恢复。',
        confirmText: '清空',
        tone: 'danger',
      });
      onFeedback(`纯函数模式：${ok ? '已清空' : '已取消'}`);
    })();
  };

  return (
    <div className="confirm-demo-actions">
      <Button onClick={handlePublish} size="small">
        发布（纯函数）
      </Button>
      <Button onClick={handleEmpty} size="small">
        清空（纯函数 danger）
      </Button>
    </div>
  );
}

export function ConfirmDemo({ onFeedback }: ConfirmDemoProps) {
  return (
    <div className="popover-grid">
      {/* 示例一：受控组件 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Component / 受控组件</span>
            <p>使用方持有 open 状态，onConfirm / onCancel 各自处理；danger 色调覆盖确认按钮。</p>
          </div>
        </div>
        <ComponentForm onFeedback={onFeedback} />
        <DemoCode code={componentExampleCode} />
      </div>

      {/* 示例二：useConfirm() hook —— 必须在 ConfirmProvider 内使用 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Hook / useConfirm()</span>
            <p>
              ConfirmProvider 在子组件树外包裹一次；hook 返回 confirm(options)，返回
              Promise&lt;boolean&gt;。
            </p>
          </div>
        </div>
        {/* ConfirmProvider 只包裹 hook 示例，避免影响其他示例的 DOM 结构 */}
        <ConfirmProvider>
          <HookForm onFeedback={onFeedback} />
        </ConfirmProvider>
        <DemoCode code={hookExampleCode} label="TSX + 说明" />
      </div>

      {/* 示例三：纯函数 confirm() —— 无需 Provider，自挂 React root */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Pure / 纯函数 confirm()</span>
            <p>
              适合在 Provider 树外或非组件代码中调用；内部惰性创建容器 + createRoot，settle
              后卸载清理。
            </p>
          </div>
        </div>
        <PureForm onFeedback={onFeedback} />
        <DemoCode code={pureExampleCode} label="TSX + 说明" />
      </div>
    </div>
  );
}
