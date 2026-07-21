import { useState } from 'react';

import { Button, Dialog } from '../index';
import { DemoCode } from './DemoCode';

interface DialogDemoProps {
  readonly onFeedback: (message: string) => void;
}

const basicExampleCode = `const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>打开对话框</Button>
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="移动笔记"
  description="确认把这篇笔记移动到选定的笔记本？"
>
  <Button variant="primary" onClick={() => setOpen(false)}>
    移动
  </Button>
</Dialog>`;

export function DialogDemo({ onFeedback }: DialogDemoProps) {
  // 基础对话框：title + description + 自定义内容
  const [basicOpen, setBasicOpen] = useState(false);
  // 无标题对话框：仅 children，靠 aria-label 命名
  const [plainOpen, setPlainOpen] = useState(false);
  // Esc / 背景点击关闭开关
  const [closeOnEsc, setCloseOnEsc] = useState(true);
  const [closeOnBackdrop, setCloseOnBackdrop] = useState(true);

  return (
    <div className="popover-grid">
      {/* 示例一：基础对话框 —— title + description + 自定义内容 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Basic / 基础对话框</span>
            <p>title + description + 自定义内容；Esc / 背景点击关闭，焦点自动落入并循环。</p>
          </div>
          <Button
            onClick={() => {
              setBasicOpen(true);
            }}
            size="small"
          >
            打开
          </Button>
        </div>
        <DemoCode code={basicExampleCode} />
      </div>

      {/* 示例二：无标题对话框 —— 仅 children，靠 aria-label 命名 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Plain / 无标题</span>
            <p>未传 title 时使用 aria-label 命名；内容区上间距自动收窄。</p>
          </div>
          <Button
            onClick={() => {
              setPlainOpen(true);
            }}
            size="small"
          >
            打开
          </Button>
        </div>
        <div className="popover-example__surface">
          <span className="popover-example__empty">点击右上角「打开」查看无标题对话框</span>
        </div>
      </div>

      {/* 示例三：Esc / 背景点击关闭开关 —— 展示 closeOnEsc / closeOnBackdrop 的可配置性 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Toggles / 关闭策略</span>
            <p>关闭下面两个开关后再打开对话框，验证 Esc / 背景点击是否被禁用。</p>
          </div>
        </div>
        <div className="dialog-demo-toggles">
          <label className="dialog-demo-toggle">
            <input
              checked={closeOnEsc}
              onChange={(event) => {
                setCloseOnEsc(event.currentTarget.checked);
              }}
              type="checkbox"
            />
            <span>closeOnEsc</span>
          </label>
          <label className="dialog-demo-toggle">
            <input
              checked={closeOnBackdrop}
              onChange={(event) => {
                setCloseOnBackdrop(event.currentTarget.checked);
              }}
              type="checkbox"
            />
            <span>closeOnBackdrop</span>
          </label>
          <Button
            onClick={() => {
              setBasicOpen(true);
            }}
            size="small"
          >
            打开（用上述开关）
          </Button>
        </div>
      </div>

      {/* 渲染区域：实际对话框实例 */}
      <Dialog
        closeOnBackdrop={closeOnBackdrop}
        closeOnEsc={closeOnEsc}
        description="确认把这篇笔记移动到选定的笔记本？移动后原位置将不再保留副本。"
        onClose={() => {
          setBasicOpen(false);
          onFeedback('已关闭对话框（基础示例）');
        }}
        open={basicOpen}
        title="移动笔记"
      >
        <Button
          onClick={() => {
            setBasicOpen(false);
            onFeedback('已确认移动笔记');
          }}
          variant="primary"
        >
          移动
        </Button>
      </Dialog>

      <Dialog
        aria-label="无标题对话框示例"
        onClose={() => {
          setPlainOpen(false);
          onFeedback('已关闭无标题对话框');
        }}
        open={plainOpen}
      >
        <p className="dialog-demo-plain-copy">
          这是一个无标题对话框。未传 title 时，使用方需要通过 aria-label 为其提供无障碍名。
        </p>
        <Button
          onClick={() => {
            setPlainOpen(false);
            onFeedback('已关闭无标题对话框');
          }}
          variant="primary"
        >
          知道了
        </Button>
      </Dialog>
    </div>
  );
}
