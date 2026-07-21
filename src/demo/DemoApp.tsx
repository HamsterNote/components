import { useState } from 'react';

import { Badge, Button, NoteCard, TextField } from '../index';
import { ConfirmDemo } from './ConfirmDemo';
import { DemoSection } from './DemoSection';
import { DialogDemo } from './DialogDemo';
import { DrawerDemo } from './DrawerDemo';
import { IconDemo } from './IconDemo';
import { KbdDemo } from './KbdDemo';
import { LoadingDemo } from './LoadingDemo';
import { MenuDemo } from './MenuDemo';
import { PopoverDemo } from './PopoverDemo';
import { ThemeDemo } from './ThemeDemo';

const navigationItems = [
  { href: '#buttons', label: 'Button' },
  { href: '#badges', label: 'Badge' },
  { href: '#fields', label: 'TextField' },
  { href: '#cards', label: 'NoteCard' },
  { href: '#popovers', label: 'Popover' },
  { href: '#menus', label: 'Menu' },
  { href: '#kbds', label: 'Kbd' },
  { href: '#loadings', label: 'Loading' },
  { href: '#icons', label: 'Icon' },
  { href: '#dialogs', label: 'Dialog' },
  { href: '#drawers', label: 'Drawer' },
  { href: '#confirms', label: 'Confirm' },
  { href: '#themes', label: 'Theme' },
] as const;

export function DemoApp() {
  const [feedback, setFeedback] = useState('等待交互');
  const [noteTitle, setNoteTitle] = useState('');
  const [selectedNote, setSelectedNote] = useState<'planning' | 'research'>('planning');
  const titleError =
    noteTitle.length > 0 && noteTitle.length < 3 ? '标题至少需要 3 个字符' : undefined;
  const titleErrorProps = titleError === undefined ? {} : { error: titleError };

  return (
    <div className="demo-shell">
      <header className="topbar">
        <a aria-label="HamsterNote Components 首页" className="brand" href="#top">
          <span aria-hidden="true" className="brand__mark">
            HN
          </span>
          <span>Components</span>
        </a>
        <nav aria-label="组件导航">
          {navigationItems.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <Badge tone="success">v0.1.0</Badge>
      </header>

      <main id="top">
        <section aria-labelledby="page-title" className="hero">
          <div className="hero__copy">
            <p className="hero__kicker">@hamster-note/components</p>
            <h1 id="page-title">
              <span>为笔记体验打造</span>
              <span>精确组件。</span>
            </h1>
            <p className="hero__lede">
              React 19 与 TypeScript 6 驱动的基础组件。每个状态都可检查、可操作，也可独立导入。
            </p>
          </div>
          <div className="hero__status" role="status">
            <span className="status-dot" />
            <div>
              <span>交互输出</span>
              <strong>{feedback}</strong>
            </div>
          </div>
        </section>

        <DemoSection
          description="覆盖层级、尺寸与禁用状态。"
          eyebrow="01 / Actions"
          id="buttons"
          title="Button"
        >
          <div className="stage-group">
            <span className="stage-label">Variants</span>
            <div className="component-row">
              <Button
                onClick={() => {
                  setFeedback('已创建一条新笔记');
                }}
                variant="primary"
              >
                新建笔记
              </Button>
              <Button
                onClick={() => {
                  setFeedback('已打开导入流程');
                }}
              >
                导入内容
              </Button>
              <Button
                onClick={() => {
                  setFeedback('已取消当前操作');
                }}
                variant="ghost"
              >
                取消
              </Button>
              <Button disabled>不可用</Button>
            </div>
          </div>
          <div className="stage-group">
            <span className="stage-label">Sizes</span>
            <div className="component-row component-row--aligned">
              <Button size="small">小尺寸</Button>
              <Button>默认尺寸</Button>
              <Button size="large">大尺寸</Button>
            </div>
          </div>
        </DemoSection>

        <DemoSection
          description="文字与色彩共同表达组件状态。"
          eyebrow="02 / Status"
          id="badges"
          title="Badge"
        >
          <div className="component-row">
            <Badge>草稿</Badge>
            <Badge tone="accent">编辑中</Badge>
            <Badge tone="success">已同步</Badge>
            <Badge tone="warning">待检查</Badge>
            <Badge tone="danger">同步失败</Badge>
          </div>
        </DemoSection>

        <DemoSection
          description="标签、提示与错误保持稳定布局。"
          eyebrow="03 / Input"
          id="fields"
          title="TextField"
        >
          <div className="field-grid">
            <TextField
              hint="输入 3 个或更多字符"
              label="笔记标题"
              onChange={(event) => {
                setNoteTitle(event.currentTarget.value);
              }}
              placeholder="例如：下季度规划"
              value={noteTitle}
              {...titleErrorProps}
            />
            <TextField defaultValue="产品 / 研究" hint="使用斜杠组织多级路径" label="所在笔记本" />
            <TextField disabled label="只读来源" placeholder="从团队空间继承" />
          </div>
        </DemoSection>

        <DemoSection
          description="交互卡片使用正确的按钮语义。"
          eyebrow="04 / Content"
          id="cards"
          title="NoteCard"
        >
          <div className="card-grid">
            <NoteCard
              excerpt="汇总季度目标与里程碑，供团队评审。"
              meta="更新于 8 分钟前 · 12 个区块"
              onClick={() => {
                setSelectedNote('planning');
                setFeedback('已选择「第三季度产品规划」');
              }}
              selected={selectedNote === 'planning'}
              title="第三季度产品规划"
            />
            <NoteCard
              excerpt="汇总访谈需求，标记待验证的产品假设。"
              meta="更新于昨天 · 8 个区块"
              onClick={() => {
                setSelectedNote('research');
                setFeedback('已选择「用户研究摘要」');
              }}
              selected={selectedNote === 'research'}
              title="用户研究摘要"
            />
          </div>
        </DemoSection>

        <DemoSection
          description="显式主题、语义分隔线与消费方控制的显示状态。"
          eyebrow="05 / Overlay"
          id="popovers"
          title="Popover"
        >
          <PopoverDemo onFeedback={setFeedback} />
        </DemoSection>

        <DemoSection
          description="语义菜单与快捷键，可独立使用或嵌入 Popover 自动继承主题。"
          eyebrow="06 / Menus"
          id="menus"
          title="Menu"
        >
          <MenuDemo onFeedback={setFeedback} />
        </DemoSection>

        <DemoSection
          description="快捷键键帽，组合键拼接与嵌入 Popover 自动继承主题。"
          eyebrow="07 / Shortcuts"
          id="kbds"
          title="Kbd"
        >
          <KbdDemo onFeedback={setFeedback} />
        </DemoSection>

        <DemoSection
          description="SVG spinner 三种形态：内联、局部覆盖（cover）、全屏单例 API（showLoading / hideLoading）。"
          eyebrow="08 / Feedback"
          id="loadings"
          title="Loading"
        >
          <LoadingDemo onFeedback={setFeedback} />
        </DemoSection>

        <DemoSection
          description="50 个 outline 风格 SVG 图标，stroke=currentColor 自动继承主题，尺寸由外层 font-size 控制。"
          eyebrow="09 / Icons"
          id="icons"
          title="Icon"
        >
          <IconDemo onFeedback={setFeedback} />
        </DemoSection>

        <DemoSection
          description="受控模态对话框，Portal 渲染到 body，焦点循环、滚动锁、Esc/背景点击关闭与出入场动画内置。"
          eyebrow="10 / Dialogs"
          id="dialogs"
          title="Dialog"
        >
          <DialogDemo onFeedback={setFeedback} />
        </DemoSection>

        <DemoSection
          description="边缘贴附抽屉，left/right/top/bottom 四向滑入，尺寸可自定义，与 Dialog 共享模态语义。"
          eyebrow="11 / Drawers"
          id="drawers"
          title="Drawer"
        >
          <DrawerDemo onFeedback={setFeedback} />
        </DemoSection>

        <DemoSection
          description="确认对话框三种形态：受控组件、useConfirm() hook、纯函数 confirm()，共用同一展示核心。"
          eyebrow="12 / Confirm"
          id="confirms"
          title="Confirm"
        >
          <ConfirmDemo onFeedback={setFeedback} />
        </DemoSection>

        <DemoSection
          description="包裹即切换主题色：预设五色 + 自定义颜色，hover 与 focusRing 自动派生，支持嵌套覆盖。"
          eyebrow="13 / Theme"
          id="themes"
          title="ThemeProvider"
        >
          <ThemeDemo onFeedback={setFeedback} />
        </DemoSection>
      </main>

      <footer>
        <span>HamsterNote UI Foundation</span>
        <code>React 19 · TypeScript 6 · Vite 8</code>
      </footer>
    </div>
  );
}
