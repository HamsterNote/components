import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Kbd,
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuSubmenu,
  Popover,
} from '../index';
import { DemoCode } from './DemoCode';

interface MenuDemoProps {
  readonly onFeedback: (message: string) => void;
}

// 下拉菜单示例展示的代码片段（与下方实现保持同步）
const dropdownExampleCode = `const [open, setOpen] = useState(false);
const [anchor, setAnchor] = useState<HTMLElement | null>(null);

<Button
  aria-haspopup="menu"
  aria-expanded={open}
  onClick={(event) => {
    setAnchor(event.currentTarget);
    setOpen((value) => !value);
  }}
>
  编辑
</Button>
{open ? (
  <Popover anchor={anchor} placement="bottom-start">
    <Menu>
      <MenuItem shortcut={<Kbd keys={['⌘', 'X']} />}>剪切</MenuItem>
      <MenuItem shortcut={<Kbd keys={['⌘', 'C']} />}>复制</MenuItem>
      <MenuSeparator />
      <MenuItem tone="danger">清空选中</MenuItem>
    </Menu>
  </Popover>
) : null}`;

// 嵌套子菜单示例展示的代码片段
const submenuExampleCode = `<Menu aria-label="笔记整理">
  <MenuItem>置顶</MenuItem>
  <MenuSubmenu label="移动到…">
    <MenuItem>收件箱</MenuItem>
    <MenuItem>产品 / 研究</MenuItem>
    <MenuSeparator />
    <MenuItem>归档</MenuItem>
  </MenuSubmenu>
  <MenuSeparator />
  <MenuItem tone="danger">删除</MenuItem>
</Menu>

// 子菜单 panel 渲染到 body 下：右侧空间不足时自动向左展开，
// 垂直方向始终保持在视口安全距离内`;

export function MenuDemo({ onFeedback }: MenuDemoProps) {
  // 示例二「按钮弹出菜单」：开合状态与锚点元素（点击时从事件目标捕获）
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // 锚定浮层引用：外部点击关闭时判断点击是否落在浮层内
  const popoverRef = useRef<HTMLDivElement>(null);

  // 统一关闭并清空锚点
  const closeMenu = () => {
    setOpen(false);
    setAnchor(null);
  };

  // 选中编辑菜单某项后统一关闭浮层并回写反馈
  const handleEdit = (message: string) => {
    closeMenu();
    onFeedback(message);
  };

  // 外部点击 / Esc 关闭：浮层经 Portal 渲染到 body 下，
  // 不能依赖组件树内的冒泡，需要在 document 上监听
  useEffect(() => {
    if (!open) {
      return;
    }
    // 关闭逻辑内联而非引用组件作用域的 closeMenu，保证 hook 依赖数组完整稳定
    const close = () => {
      setOpen(false);
      setAnchor(null);
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (anchor?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      close();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, anchor]);

  return (
    <div className="popover-grid">
      {/* 示例一：独立菜单，不依赖 Popover，直接展示 Menu 的语义结构 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Standalone / 独立菜单</span>
            <p>MenuLabel 分组 + MenuItem 快捷键 + MenuSeparator + danger 项。</p>
          </div>
        </div>
        <div className="popover-example__surface">
          <div className="menu-demo-card">
            <Menu aria-label="文件操作">
              <MenuLabel>文件</MenuLabel>
              <MenuItem
                onClick={() => {
                  onFeedback('已新建笔记');
                }}
                shortcut={<Kbd keys={['⌘', 'N']} />}
              >
                新建笔记
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onFeedback('已进入重命名');
                }}
                shortcut={<Kbd>F2</Kbd>}
              >
                重命名
              </MenuItem>
              <MenuSubmenu label="移动到…">
                <MenuItem
                  onClick={() => {
                    onFeedback('已移动到「收件箱」');
                  }}
                >
                  收件箱
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onFeedback('已移动到「产品 / 研究」');
                  }}
                >
                  产品 / 研究
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onFeedback('已移动到「产品 / 规划」');
                  }}
                >
                  产品 / 规划
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  onClick={() => {
                    onFeedback('已移动到「归档」');
                  }}
                >
                  归档
                </MenuItem>
              </MenuSubmenu>
              <MenuSeparator />
              <MenuItem
                onClick={() => {
                  onFeedback('已删除笔记');
                }}
                tone="danger"
              >
                删除
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>

      {/* 示例二：点击按钮弹出菜单。菜单经 Popover 锚定模式渲染到 body 下，
          靠近视口下边缘时自动向上翻转，支持外部点击 / Esc 关闭 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Dropdown / 按钮弹出菜单</span>
            <p>点击按钮在 body 下弹出菜单，自动躲避视口边缘；外部点击或 Esc 关闭。</p>
          </div>
          <Button
            aria-controls="edit-menu-popover"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={(event) => {
              if (open) {
                closeMenu();
                return;
              }
              setAnchor(event.currentTarget);
              setOpen(true);
            }}
            size="small"
          >
            {open ? '收起' : '编辑'}
          </Button>
        </div>
        <div className="popover-example__surface menu-demo-popover-surface">
          {open ? (
            <Popover
              anchor={anchor}
              aria-label="编辑操作"
              id="edit-menu-popover"
              placement="bottom-start"
              ref={popoverRef}
            >
              <Menu>
                <MenuItem
                  onClick={() => {
                    handleEdit('已剪切');
                  }}
                  shortcut={<Kbd keys={['⌘', 'X']} />}
                >
                  剪切
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleEdit('已复制');
                  }}
                  shortcut={<Kbd keys={['⌘', 'C']} />}
                >
                  复制
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleEdit('已粘贴');
                  }}
                  shortcut={<Kbd keys={['⌘', 'V']} />}
                >
                  粘贴
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  onClick={() => {
                    handleEdit('已清空选中内容');
                  }}
                  tone="danger"
                >
                  清空选中
                </MenuItem>
              </Menu>
            </Popover>
          ) : (
            <span className="popover-example__empty">点击右上角「编辑」按钮弹出菜单</span>
          )}
        </div>
        <DemoCode code={dropdownExampleCode} />
      </div>

      {/* 示例三：嵌套子菜单，展示 MenuSubmenu 在 Popover 内自动继承主题、
          悬停向右展开（右溢出自动左翻）+ 键盘右进左出的交互闭环 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Submenu / 嵌套子菜单</span>
            <p>
              MenuSubmenu 悬停向右展开，panel 渲染到 body
              下、右侧不足时自动左翻；右箭头进入、左箭头返回。
            </p>
          </div>
        </div>
        <div className="popover-example__surface menu-demo-popover-surface">
          <Popover aria-label="笔记整理">
            <Menu>
              <MenuItem
                onClick={() => {
                  onFeedback('已置顶笔记');
                }}
              >
                置顶
              </MenuItem>
              <MenuSubmenu label="移动到…">
                <MenuItem
                  onClick={() => {
                    onFeedback('已移动到「收件箱」');
                  }}
                >
                  收件箱
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onFeedback('已移动到「产品 / 研究」');
                  }}
                >
                  产品 / 研究
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onFeedback('已移动到「产品 / 规划」');
                  }}
                >
                  产品 / 规划
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  onClick={() => {
                    onFeedback('已移动到「归档」');
                  }}
                >
                  归档
                </MenuItem>
              </MenuSubmenu>
              <MenuSubmenu disabled label="添加标签">
                <MenuItem>待处理</MenuItem>
                <MenuItem>进行中</MenuItem>
                <MenuItem>已完成</MenuItem>
              </MenuSubmenu>
              <MenuSeparator />
              <MenuItem
                onClick={() => {
                  onFeedback('已删除笔记');
                }}
                tone="danger"
              >
                删除
              </MenuItem>
            </Menu>
          </Popover>
        </div>
        <DemoCode code={submenuExampleCode} label="TSX + 说明" />
      </div>
    </div>
  );
}
