import { useState } from 'react';

import { Button, Kbd, Menu, MenuItem, MenuSeparator, Popover } from '../index';

interface KbdDemoProps {
  // 与其他 demo 一致：交互后回写顶部 hero 的「交互输出」状态
  readonly onFeedback: (message: string) => void;
}

export function KbdDemo({ onFeedback }: KbdDemoProps) {
  // 嵌入 Popover 示例的开合状态，默认关闭
  const [open, setOpen] = useState(false);

  // 选中菜单某项后统一关闭浮层并回写反馈
  const handleMenu = (message: string) => {
    setOpen(false);
    onFeedback(message);
  };

  return (
    <div className="popover-grid">
      {/* 示例一：基础键帽 —— 单个修饰键、字母、功能键，演示 children 写法 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Basic / 单键帽</span>
            <p>children 写法：修饰键、字母、功能键，键帽质感由 token 自动派生。</p>
          </div>
        </div>
        <div className="popover-example__surface kbd-demo-row">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <Kbd>F2</Kbd>
          <Kbd>Esc</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd>Tab</Kbd>
        </div>
      </div>

      {/* 示例二：组合键 —— keys 写法，键帽间自动插入 + 连接符 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Combo / 组合键</span>
            <p>keys 写法：键帽之间用不带键帽样式的小号 + 连接符拼接。</p>
          </div>
        </div>
        <div className="popover-example__surface kbd-demo-row">
          <Kbd keys={['⌘', 'K']} />
          <Kbd keys={['⌘', '⇧', 'P']} />
          <Kbd keys={['Ctrl', 'Alt', 'Delete']} />
          <Kbd keys={['⌘', 'Enter']} />
          <Kbd keys={['Shift', 'Tab']} />
        </div>
      </div>

      {/* 示例三：嵌入 Popover 内展示主题继承（dark 主题，与 MenuDemo 的 Popover 用法一致） */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">In Popover / 主题继承</span>
            <p>Kbd 作为 MenuItem 的 shortcut 渲染，Popover dark 主题自动继承到键帽文本与背景。</p>
          </div>
          <Button
            aria-controls="kbd-menu-popover"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => {
              setOpen((current) => !current);
            }}
            size="small"
          >
            {open ? '收起' : '编辑'}
          </Button>
        </div>
        <div className="popover-example__surface kbd-demo-popover-surface">
          {open ? (
            <Popover aria-label="快捷键操作" id="kbd-menu-popover">
              <Menu>
                <MenuItem
                  onClick={() => {
                    handleMenu('已执行 ⌘Z 撤销');
                  }}
                  shortcut={<Kbd keys={['⌘', 'Z']} />}
                >
                  撤销
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenu('已执行 ⌘⇧Z 重做');
                  }}
                  shortcut={<Kbd keys={['⌘', '⇧', 'Z']} />}
                >
                  重做
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenu('已执行 ⌘K 打开命令面板');
                  }}
                  shortcut={<Kbd keys={['⌘', 'K']} />}
                >
                  命令面板
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  onClick={() => {
                    handleMenu('已执行 ⌘W 关闭标签');
                  }}
                  shortcut={<Kbd keys={['⌘', 'W']} />}
                >
                  关闭标签
                </MenuItem>
              </Menu>
            </Popover>
          ) : (
            <span className="popover-example__empty">Menu 已收起</span>
          )}
        </div>
      </div>

      {/* 示例四：行内文案中的键帽 —— 展示 Kbd 在段落里的自然嵌入 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Inline / 行内文案</span>
            <p>Kbd 在文案里自然嵌入，键帽与文字基线对齐。</p>
          </div>
        </div>
        <div className="popover-example__surface kbd-demo-inline">
          <p>
            按 <Kbd keys={['⌘', 'K']} /> 打开命令面板，或按 <Kbd>Esc</Kbd> 关闭浮层； 保存请用{' '}
            <Kbd keys={['⌘', 'S']} />
            ，撤销用 <Kbd keys={['⌘', 'Z']} />。
          </p>
        </div>
      </div>
    </div>
  );
}
