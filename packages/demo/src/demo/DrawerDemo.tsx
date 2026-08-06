import { useState } from 'react';

import { Button, Drawer, type DrawerPlacement } from '@hamster-note/components';
import { DemoCode } from './DemoCode';

interface DrawerDemoProps {
  readonly onFeedback: (message: string) => void;
}

const placementExampleCode = `const [open, setOpen] = useState(false);
const [placement, setPlacement] = useState<DrawerPlacement>('right');

<Button onClick={() => setOpen(true)}>打开抽屉</Button>
<Drawer
  open={open}
  onClose={() => setOpen(false)}
  placement={placement}
  showCloseButton
  showFullscreenButton
  title="笔记详情"
  description="右侧滑入的详情面板"
>
  <p>内容区可滚动，承载长表单或详情。</p>
</Drawer>`;

const PLACEMENTS: readonly { readonly placement: DrawerPlacement; readonly label: string }[] = [
  { placement: 'right', label: '右侧' },
  { placement: 'left', label: '左侧' },
  { placement: 'top', label: '顶部' },
  { placement: 'bottom', label: '底部' },
] as const;

export function DrawerDemo({ onFeedback }: DrawerDemoProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<DrawerPlacement>('right');
  const [customSize, setCustomSize] = useState<number | null>(null);

  const openWith = (nextPlacement: DrawerPlacement, size: number | null) => {
    setPlacement(nextPlacement);
    setCustomSize(size);
    setOpen(true);
  };

  return (
    <div className="popover-grid">
      {/* 示例一：四种 placement —— 默认尺寸 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Placement / 四个方向</span>
            <p>标题向上拖动进入全屏、向下拖动恢复；底部使用箭头，其余方向使用全屏图标。</p>
          </div>
        </div>
        <div className="drawer-demo-row">
          {PLACEMENTS.map((item) => (
            <Button
              key={item.placement}
              onClick={() => {
                openWith(item.placement, null);
              }}
              size="small"
            >
              {item.label}
            </Button>
          ))}
        </div>
        <DemoCode code={placementExampleCode} />
      </div>

      {/* 示例二：自定义 size —— 覆盖默认宽 / 高 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Custom Size / 自定义尺寸</span>
            <p>size 覆盖默认值（左右控宽、上下控高）；下方右侧抽屉宽 520，顶部抽屉高 180。</p>
          </div>
        </div>
        <div className="drawer-demo-row">
          <Button
            onClick={() => {
              openWith('right', 520);
              onFeedback('已打开右侧 520px 抽屉');
            }}
            size="small"
          >
            右侧 520
          </Button>
          <Button
            onClick={() => {
              openWith('top', 180);
              onFeedback('已打开顶部 180px 抽屉');
            }}
            size="small"
          >
            顶部 180
          </Button>
        </div>
      </div>

      <Drawer
        description={`placement=${placement}${customSize === null ? '' : `，size=${String(customSize)}px`}`}
        onClose={() => {
          setOpen(false);
          onFeedback(`已关闭 ${placement} 抽屉`);
        }}
        open={open}
        placement={placement}
        showCloseButton
        showFullscreenButton
        size={customSize ?? undefined}
        title="抽屉标题"
      >
        <p className="drawer-demo-copy">
          这是抽屉的内容区，可滚动承载长表单或详情。
          <span className="drawer-demo-copy__nowrap">
            当前方向：<strong>{placement}</strong>
          </span>
          {customSize === null ? null : (
            <span className="drawer-demo-copy__nowrap">
              ，自定义尺寸 <strong>{customSize}px</strong>
            </span>
          )}
          。
        </p>
        <Button
          onClick={() => {
            setOpen(false);
            onFeedback(`已通过按钮关闭 ${placement} 抽屉`);
          }}
          variant="primary"
        >
          关闭抽屉
        </Button>
      </Drawer>
    </div>
  );
}
