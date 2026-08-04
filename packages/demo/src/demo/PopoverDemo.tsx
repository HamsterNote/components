import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Popover,
  PopoverSeparator,
  ThemeProvider,
  type PopoverEdge,
} from '@hamster-note/components';
import { DemoCode } from './DemoCode';

interface PopoverDemoProps {
  readonly onFeedback: (message: string) => void;
}

// 锚点定位示例中四角触发按钮的标识
type CornerId = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// 贴边示例中四个屏幕边缘的配置项
interface ScreenEdgeOption {
  readonly edge: PopoverEdge;
  readonly label: string;
}

const screenEdgeOptions: readonly ScreenEdgeOption[] = [
  { edge: 'top', label: '贴上边' },
  { edge: 'bottom', label: '贴下边' },
  { edge: 'left', label: '贴左边' },
  { edge: 'right', label: '贴右边' },
] as const;

// 锚点示例展示的代码片段（与下方实现保持同步）
const anchorExampleCode = `<Button onClick={(event) => setAnchor(event.currentTarget)}>
  右下
</Button>
{anchor !== null ? (
  <Popover
    anchor={anchor}
    placement="bottom-start"
    viewportMargin={12}
    role="toolbar"
  >
    <Button ghost size="small">加粗</Button>
    <Button ghost size="small">斜体</Button>
  </Popover>
) : null}`;

export function PopoverDemo({ onFeedback }: PopoverDemoProps) {
  const [activeTheme, setActiveTheme] = useState<'dark' | 'light' | null>('dark');
  // 竖排示例：独立的开合状态，避免与主题示例互斥
  const [verticalOpen, setVerticalOpen] = useState(false);
  // 锚点示例：当前打开的角与其触发元素（作为 Popover 的定位锚点）
  const [activeCorner, setActiveCorner] = useState<CornerId | null>(null);
  const [cornerAnchor, setCornerAnchor] = useState<HTMLElement | null>(null);
  // 贴边示例：当前生效的屏幕边缘，null 表示全部关闭
  const [activeScreenEdge, setActiveScreenEdge] = useState<PopoverEdge | null>(null);
  // 相对贴边示例：浮层以 absolute 贴在虚线容器（而非视口）边缘
  const [activeRelativeEdge, setActiveRelativeEdge] = useState<PopoverEdge | null>(null);
  // 锚定浮层引用：外部点击关闭时判断点击是否落在浮层内
  const cornerPopoverRef = useRef<HTMLDivElement>(null);

  // 锚点示例的外部点击 / Esc 关闭：浮层经 Portal 渲染到 body 下，
  // 不能依赖组件树内的冒泡，需要在 document 上监听
  useEffect(() => {
    if (activeCorner === null) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (cornerAnchor?.contains(target) || cornerPopoverRef.current?.contains(target)) {
        return;
      }
      setActiveCorner(null);
      setCornerAnchor(null);
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveCorner(null);
        setCornerAnchor(null);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCorner, cornerAnchor]);

  const handleCornerToggle = (corner: CornerId, anchor: HTMLElement) => {
    if (activeCorner === corner) {
      // 再次点击同一角按钮 → 关闭
      setActiveCorner(null);
      setCornerAnchor(null);
      return;
    }
    setActiveCorner(corner);
    setCornerAnchor(anchor);
  };

  const handleScreenEdgeToggle = (edge: PopoverEdge) => {
    setActiveScreenEdge((current) => (current === edge ? null : edge));
  };

  const handleRelativeEdgeToggle = (edge: PopoverEdge) => {
    setActiveRelativeEdge((current) => (current === edge ? null : edge));
  };

  return (
    <div className="popover-grid">
      <ThemeProvider mode="dark">
        <div className="popover-example">
          <div className="popover-example__header">
            <div>
              <span className="stage-label">Dark / Default</span>
              <p>延续编辑器的深色浮层。</p>
            </div>
            <Button
              aria-controls="dark-popover"
              aria-expanded={activeTheme === 'dark'}
              onClick={() => {
                setActiveTheme((current) => (current === 'dark' ? null : 'dark'));
              }}
              size="small"
            >
              {activeTheme === 'dark' ? '收起' : '显示'}
            </Button>
          </div>
          <div className="popover-example__surface">
            {activeTheme === 'dark' ? (
              <Popover aria-label="深色文字操作" id="dark-popover" role="toolbar">
                <Button ghost size="small">
                  加粗
                </Button>
                <Button ghost size="small">
                  斜体
                </Button>
                <PopoverSeparator />
                <Button
                  onClick={() => {
                    onFeedback('已通过深色 Popover 创建链接');
                  }}
                  size="small"
                  ghost
                >
                  链接
                </Button>
              </Popover>
            ) : (
              <span className="popover-example__empty">Popover 已收起</span>
            )}
          </div>
        </div>
      </ThemeProvider>

      <ThemeProvider mode="light">
        <div className="popover-example popover-example--light">
          <div className="popover-example__header">
            <div>
              <span className="stage-label">Light</span>
              <p>适配浅色内容区域。</p>
            </div>
            <Button
              aria-controls="light-popover"
              aria-expanded={activeTheme === 'light'}
              onClick={() => {
                setActiveTheme((current) => (current === 'light' ? null : 'light'));
              }}
              size="small"
            >
              {activeTheme === 'light' ? '收起' : '显示'}
            </Button>
          </div>
          <div className="popover-example__surface">
            {activeTheme === 'light' ? (
              <Popover aria-label="浅色文字操作" id="light-popover" role="toolbar" theme="light">
                <Button ghost size="small">
                  对齐
                </Button>
                <PopoverSeparator />
                <Button
                  onClick={() => {
                    onFeedback('已通过浅色 Popover 添加评论');
                  }}
                  size="small"
                  ghost
                >
                  评论
                </Button>
              </Popover>
            ) : (
              <span className="popover-example__empty">Popover 已收起</span>
            )}
          </div>
        </div>
      </ThemeProvider>

      {/* 锚点定位示例：四角按钮统一用 bottom-start 期望方位，
          靠近右 / 下边缘时由 Popover 自动翻转并 clamp 到视口安全距离内 */}
      <div className="popover-example popover-example--edge-safe">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Anchor / 锚点定位</span>
            <p>
              传入 anchor 后浮层渲染到 body 下并自动躲避视口边缘；容器 overflow: hidden
              也不再裁剪浮层。
            </p>
          </div>
        </div>
        <div className="popover-edge-safe">
          <Button
            aria-controls="anchor-popover"
            aria-expanded={activeCorner === 'top-left'}
            className="popover-edge-safe__btn popover-edge-safe__btn--tl"
            onClick={(event) => {
              handleCornerToggle('top-left', event.currentTarget);
            }}
            size="small"
          >
            左上
          </Button>
          <Button
            aria-controls="anchor-popover"
            aria-expanded={activeCorner === 'top-right'}
            className="popover-edge-safe__btn popover-edge-safe__btn--tr"
            onClick={(event) => {
              handleCornerToggle('top-right', event.currentTarget);
            }}
            size="small"
          >
            右上
          </Button>
          <Button
            aria-controls="anchor-popover"
            aria-expanded={activeCorner === 'bottom-left'}
            className="popover-edge-safe__btn popover-edge-safe__btn--bl"
            onClick={(event) => {
              handleCornerToggle('bottom-left', event.currentTarget);
            }}
            size="small"
          >
            左下
          </Button>
          <Button
            aria-controls="anchor-popover"
            aria-expanded={activeCorner === 'bottom-right'}
            className="popover-edge-safe__btn popover-edge-safe__btn--br"
            onClick={(event) => {
              handleCornerToggle('bottom-right', event.currentTarget);
            }}
            size="small"
          >
            右下
          </Button>
          {cornerAnchor !== null ? (
            <Popover
              anchor={cornerAnchor}
              aria-label="锚点定位文字操作"
              id="anchor-popover"
              placement="bottom-start"
              ref={cornerPopoverRef}
              role="toolbar"
              viewportMargin={12}
            >
              <Button ghost size="small">
                加粗
              </Button>
              <Button ghost size="small">
                斜体
              </Button>
              <PopoverSeparator />
              <Button
                onClick={() => {
                  onFeedback('已通过锚点 Popover 应用格式');
                }}
                size="small"
                ghost
              >
                链接
              </Button>
            </Popover>
          ) : null}
        </div>
        <DemoCode code={anchorExampleCode} />
      </div>

      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Vertical / 竖排</span>
            <p>orientation=&quot;vertical&quot; 侧边工具条，分隔符自动变水平线。</p>
          </div>
          <Button
            aria-controls="vertical-popover"
            aria-expanded={verticalOpen}
            onClick={() => {
              setVerticalOpen((current) => !current);
            }}
            size="small"
          >
            {verticalOpen ? '收起' : '显示'}
          </Button>
        </div>
        <div className="popover-example__surface">
          {verticalOpen ? (
            <Popover
              aria-label="竖排文字操作"
              id="vertical-popover"
              orientation="vertical"
              role="toolbar"
            >
              <Button ghost size="small">
                加粗
              </Button>
              <Button ghost size="small">
                斜体
              </Button>
              <Button ghost size="small">
                下划线
              </Button>
              <PopoverSeparator />
              <Button
                onClick={() => {
                  onFeedback('已通过竖排 Popover 添加链接');
                }}
                size="small"
                ghost
              >
                链接
              </Button>
            </Popover>
          ) : (
            <span className="popover-example__empty">Popover 已收起</span>
          )}
        </div>
      </div>

      <div className="popover-example popover-example--screen-edge">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Screen Edge / 贴边</span>
            <p>edge prop 让浮层以 position: fixed 贴视口边缘，edgeOffset=24，同时只显示一个。</p>
          </div>
        </div>
        <div className="popover-screen-edge">
          {screenEdgeOptions.map((option) => (
            <Button
              aria-controls="screen-edge-popover"
              aria-expanded={activeScreenEdge === option.edge}
              key={option.edge}
              onClick={() => {
                handleScreenEdgeToggle(option.edge);
              }}
              size="small"
            >
              {option.label}
            </Button>
          ))}
          {activeScreenEdge !== null ? (
            <Popover
              aria-label="贴边浮层"
              edge={activeScreenEdge}
              edgeOffset={24}
              id="screen-edge-popover"
              role="toolbar"
            >
              <Button
                onClick={() => {
                  onFeedback('已通过贴边 Popover 执行操作');
                }}
                size="small"
                ghost
              >
                操作
              </Button>
              <PopoverSeparator />
              <Button
                onClick={() => {
                  setActiveScreenEdge(null);
                }}
                size="small"
                ghost
              >
                关闭
              </Button>
            </Popover>
          ) : null}
        </div>
      </div>
      <div className="popover-example popover-example--relative-edge">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Relative Edge / 相对贴边</span>
            <p>
              relative + edge 让浮层以 position: absolute 贴在最近定位祖先（虚线框）边缘，
              不再相对视口 fixed。
            </p>
          </div>
        </div>
        <div className="popover-relative-stage">
          {activeRelativeEdge !== null ? (
            <Popover
              aria-label="相对贴边浮层"
              edge={activeRelativeEdge}
              edgeOffset={12}
              id="relative-edge-popover"
              relative
              role="toolbar"
            >
              <Button
                onClick={() => {
                  onFeedback('已通过相对贴边 Popover 执行操作');
                }}
                size="small"
                ghost
              >
                操作
              </Button>
              <PopoverSeparator />
              <Button
                onClick={() => {
                  setActiveRelativeEdge(null);
                }}
                size="small"
                ghost
              >
                关闭
              </Button>
            </Popover>
          ) : null}
        </div>
        <div className="popover-relative-controls">
          {screenEdgeOptions.map((option) => (
            <Button
              aria-controls="relative-edge-popover"
              aria-expanded={activeRelativeEdge === option.edge}
              key={option.edge}
              onClick={() => {
                handleRelativeEdgeToggle(option.edge);
              }}
              size="small"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
