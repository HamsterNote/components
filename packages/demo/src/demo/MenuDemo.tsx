import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Kbd,
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuSubmenu,
} from '@hamster-note/components';
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
  <Menu anchor={anchor} aria-label="编辑操作">
    <MenuItem shortcut={<Kbd keys={['⌘', 'X']} />}>剪切</MenuItem>
    <MenuItem shortcut={<Kbd keys={['⌘', 'C']} />}>复制</MenuItem>
    <MenuSeparator />
    <MenuItem tone="danger">清空选中</MenuItem>
  </Menu>
) : null}`;

// 嵌套子菜单示例展示的代码片段（与下方实现保持同步）
const submenuExampleCode = `const [open, setOpen] = useState(false);
const [anchor, setAnchor] = useState<HTMLElement | null>(null);

<Button
  aria-haspopup="menu"
  aria-expanded={open}
  onClick={(event) => {
    setAnchor(event.currentTarget);
    setOpen((value) => !value);
  }}
>
  整理
</Button>
{open ? (
  <Menu anchor={anchor} aria-label="笔记整理">
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
) : null}

// 子菜单 panel 同样是浮动 Menu，渲染到 body 下：
// 右侧空间不足时自动向左展开，垂直方向保持在视口安全距离内`;

export function MenuDemo({ onFeedback }: MenuDemoProps) {
  // 示例二「按钮弹出菜单」：开合状态与锚点元素（点击时从事件目标捕获）
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // 锚定菜单引用：外部点击关闭时判断点击是否落在菜单内
  const menuRef = useRef<HTMLDivElement>(null);
  // 示例三「嵌套子菜单」：同为按钮触发的锚定菜单，独立持有开合状态与锚点
  const [organizeOpen, setOrganizeOpen] = useState(false);
  const [organizeAnchor, setOrganizeAnchor] = useState<HTMLElement | null>(null);
  const organizeMenuRef = useRef<HTMLDivElement>(null);

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

  // 统一关闭示例三菜单并清空锚点
  const closeOrganizeMenu = () => {
    setOrganizeOpen(false);
    setOrganizeAnchor(null);
  };

  // 选中整理菜单某项后统一关闭浮层并回写反馈
  const handleOrganize = (message: string) => {
    closeOrganizeMenu();
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
      if (anchor?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      close();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
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

  // 示例三菜单的外部点击 / Esc 关闭，与示例二同理（浮层在 body 下，
  // 需在 document 上监听）；两个示例的开合状态相互独立
  useEffect(() => {
    if (!organizeOpen) {
      return;
    }
    // 关闭逻辑内联而非引用组件作用域的 closeOrganizeMenu，保证 hook 依赖数组完整稳定
    const close = () => {
      setOrganizeOpen(false);
      setOrganizeAnchor(null);
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (organizeAnchor?.contains(target) || organizeMenuRef.current?.contains(target)) {
        return;
      }
      // 子菜单 panel 经独立 Portal 渲染到 body，不是根菜单的 DOM 后代，
      // 需要按 class 判断点击是否落在本菜单树的子菜单 panel 内
      if (target instanceof Element && target.closest('.hn-menu__submenu-panel')) {
        return;
      }
      close();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        close();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [organizeOpen, organizeAnchor]);

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

      {/* 示例二：点击按钮弹出菜单。菜单经锚定模式渲染到 body 下（.hn-menu 直接
          作为浮层表面，不再外套 Popover），靠近视口下边缘时自动向上翻转，
          支持外部点击 / Esc 关闭 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Dropdown / 按钮弹出菜单</span>
            <p>点击按钮在 body 下弹出菜单，自动躲避视口边缘；外部点击或 Esc 关闭。</p>
          </div>
          <Button
            aria-controls="edit-menu"
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
            <Menu anchor={anchor} aria-label="编辑操作" id="edit-menu" ref={menuRef}>
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
          ) : (
            <span className="popover-example__empty">点击右上角「编辑」按钮弹出菜单</span>
          )}
        </div>
        <DemoCode code={dropdownExampleCode} />
      </div>

      {/* 示例三：嵌套子菜单。按钮触发的锚定菜单内嵌 MenuSubmenu——根菜单与子菜单
          panel 都是浮动 Menu（.hn-menu 直接作为浮层表面，不再外套 Popover），
          悬停向右展开（右溢出自动左翻）+ 键盘右进左出的交互闭环 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Submenu / 嵌套子菜单</span>
            <p>
              下拉菜单内嵌 MenuSubmenu：悬停向右展开，panel 渲染到 body
              下、右侧不足时自动左翻；右箭头进入、左箭头返回。
            </p>
          </div>
          <Button
            aria-controls="organize-menu"
            aria-expanded={organizeOpen}
            aria-haspopup="menu"
            onClick={(event) => {
              if (organizeOpen) {
                closeOrganizeMenu();
                return;
              }
              setOrganizeAnchor(event.currentTarget);
              setOrganizeOpen(true);
            }}
            size="small"
          >
            {organizeOpen ? '收起' : '整理'}
          </Button>
        </div>
        <div className="popover-example__surface menu-demo-popover-surface">
          {organizeOpen ? (
            <Menu
              anchor={organizeAnchor}
              aria-label="笔记整理"
              id="organize-menu"
              ref={organizeMenuRef}
            >
              <MenuItem
                onClick={() => {
                  handleOrganize('已置顶笔记');
                }}
              >
                置顶
              </MenuItem>
              <MenuSubmenu label="移动到…">
                <MenuItem
                  onClick={() => {
                    handleOrganize('已移动到「收件箱」');
                  }}
                >
                  收件箱
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleOrganize('已移动到「产品 / 研究」');
                  }}
                >
                  产品 / 研究
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleOrganize('已移动到「产品 / 规划」');
                  }}
                >
                  产品 / 规划
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  onClick={() => {
                    handleOrganize('已移动到「归档」');
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
                  handleOrganize('已删除笔记');
                }}
                tone="danger"
              >
                删除
              </MenuItem>
            </Menu>
          ) : (
            <span className="popover-example__empty">点击右上角「整理」按钮弹出菜单</span>
          )}
        </div>
        <DemoCode code={submenuExampleCode} label="TSX + 说明" />
      </div>
    </div>
  );
}
