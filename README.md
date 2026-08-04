# HamsterNote Components

HamsterNote 的 React 19 组件库 monorepo，使用 TypeScript 6、Vite 8 与 Yarn Workspaces 构建。

[![npm version](https://img.shields.io/npm/v/@hamster-note/components/beta)](https://www.npmjs.com/package/@hamster-note/components)
[![license](https://img.shields.io/npm/l/@hamster-note/components)](https://github.com/HamsterNote/components/blob/main/LICENSE)
[![demo](https://img.shields.io/badge/demo-hamsternote.github.io-8b5cf6)](https://hamsternote.github.io/components/)

## 简介

`@hamster-note/components` 是 HamsterNote 产品线共用的 React 基础组件库，覆盖按钮、
图标、表单、浮层、菜单、模态与主题等常见界面要素。组件只引用全局 CSS token，配合
`ThemeProvider` 即可零侵入切换主题色与明暗模式；所有组件暗色为默认视觉，亮色一键
切换。仓库地址：<https://github.com/HamsterNote/components>。

`@hamster-note/components-pro` 在相同设计系统上提供面向产品协作场景的复合组件。
第一期包含基于基础 `Drawer` 组合的 `CommentDrawer` 评论面板。两个组件库共享同一个
在线 Demo，确保基础组件与 Pro 组件在真实组合场景中一起验证。

## Monorepo 结构

- `packages/components`：基础组件库 `@hamster-note/components`。
- `packages/components-pro`：复合组件库 `@hamster-note/components-pro`。
- `packages/demo`：同时展示并消费两个库的共享 Demo。
- `e2e`：针对共享 Demo 的浏览器端用户流程测试。

## 特性

- **React 19 + TypeScript 6 + Vite 8**：面向最新 React 生态构建，完整类型声明随包
  分发。
- **Token 化零侵入主题**：所有组件只引用全局 token（`--hn-color-accent` /
  `--hn-color-surface` / `--hn-color-text` 等），`ThemeProvider` 在包裹层重定义同名
  token、经 CSS 级联让子树自动继承，无需 prop drilling，也不打断外层 flex/grid
  布局。
- **无障碍内置**：模态组件自带焦点循环、滚动锁与 Esc / 背景点击关闭，`title` /
  `description` 自动完成 aria 连接，出入场动画尊重 `prefers-reduced-motion`。
- **可 tree-shake 的子路径入口**：除根入口外提供 13 个独立入口（`button` / `icon` /
  `badge` / `confirm` / `dialog` / `drawer` / `kbd` / `loading` / `menu` /
  `note-card` / `popover` / `text-field` / `theme`）以及独立的 `styles.css`，按需
  引入，不打包多余代码。
- **暗色默认 + 亮色模式**：`tokens.css` 的 `:root` 默认值为暗色，
  `ThemeProvider mode="light"` 一键切换亮色，accent 与 mode 两轴正交可组合。

## 在线 Demo

<https://hamsternote.github.io/components/> 交互式展示每个组件的全部形态与主题组合，
main 分支推送后经 GitHub Actions 自动部署，始终与最新代码保持一致。

## 安装

包当前以 `beta` dist-tag 发布：

```bash
npm install @hamster-note/components@beta
# 或
yarn add @hamster-note/components@beta
```

使用 Pro 组件时同时安装两个包：

```bash
npm install @hamster-note/components@beta @hamster-note/components-pro@beta
# 或
yarn add @hamster-note/components@beta @hamster-note/components-pro@beta
```

peer dependencies 为 `react ^19` 与 `react-dom ^19`，需项目自行提供。组件样式独立
分发，使用时需显式引入一次：

```tsx
import '@hamster-note/components/styles.css';
```

Pro 组件继续复用基础 token，并额外引入自身样式：

```tsx
import { CommentDrawer } from '@hamster-note/components-pro/comment-drawer';
import '@hamster-note/components/styles.css';
import '@hamster-note/components-pro/styles.css';
```

## 快速开始

先引入组件样式，再从根入口或独立组件入口导入：

```tsx
import { Button, Popover, PopoverSeparator, TextField } from '@hamster-note/components';
import '@hamster-note/components/styles.css';

export function Example() {
  return (
    <form>
      <TextField label="笔记标题" placeholder="输入标题" />
      <Button type="submit" variant="primary">
        保存笔记
      </Button>
    </form>
  );
}
```

也可以使用支持 tree-shaking 的独立入口：

```tsx
import { Button } from '@hamster-note/components/button';
import '@hamster-note/components/styles.css';
```

## 组件

- `Button`：primary、danger、warning、success、info、secondary 六种操作层级、三种尺寸，以及可与
  任意层级组合的布尔型 `ghost` 展示属性。
- `Icon`：第一期 outline 风格图标集，内置 55 个 24×24 图标（`ICON_NAMES` 导出全部
  名称）；颜色跟随外层 `color`、尺寸跟随 `font-size`，`label` 提供可访问名。
- `Badge`：neutral、accent、success、warning、danger 五种语义状态。
- `TextField`：持久标签、辅助信息、错误状态与完整原生 input 属性。
- `NoteCard`：静态语义文章或带选择状态的交互卡片。
- `Loading`：加载指示器。内联 / 局部覆盖 / 全屏单例三种形态，`size` 三档与 Button
  尺寸语义一致，命令式 `showLoading()` / `hideLoading()` 可在组件树外调用。
- `Popover`：支持 `dark`（默认）与 `light` 主题的通用浮层表面，搭配语义化
  `PopoverSeparator` 分组内容；`anchor` 模式下经 Portal 渲染到 body 并自动躲避视口边缘。
- `Menu`：`role="menu"` 语义菜单列表，含 `MenuItem`（支持 `shortcut` 与 `danger` tone）、
  `MenuLabel`、`MenuSeparator` 与 `MenuSubmenu`（嵌套子菜单，panel 渲染到 body 下、
  右侧不足自动左翻，panel 即浮动 `Menu` 自身）。传入 `anchor` 后 `.hn-menu` 直接作为
  下拉浮层表面（自带边框 / 阴影与 dark token，可 `data-theme="light"`），无需外套
  `Popover`；也可嵌入 `Popover` 自动继承主题。
- `Kbd`：纯展示型快捷键键帽组件。`keys` 渲染组合键序列（键帽间用小号 `+` 连接符拼接），
  `children` 渲染单个键帽；颜色一律引用全局 token，嵌入 `Popover` 自动继承主题。
- `Dialog`：受控模态对话框。Portal 渲染到 `document.body`，并自动桥接外层
  `ThemeProvider` 的 accent 与明暗主题；内置焦点循环、滚动锁、Esc / 背景点击关闭与
  出入场动画（尊重 `prefers-reduced-motion`）。`showCloseButton` 控制右上角关闭按钮，
  `showFullscreenButton` 控制其左侧的全屏切换按钮，二者默认均为 `false`。
- `Drawer`：边缘贴附模态抽屉。`placement` 支持 `left` / `right` / `top` / `bottom`
  （默认 `right`），`size` 覆盖自适应状态的默认尺寸（左右 360 / 上下 280）；标题区域
  向上拖动至少 56px 进入全屏、向下拖动恢复，`showFullscreenButton` 在标题左侧提供等价的
  箭头按钮，`showCloseButton` 在右上角显示关闭按钮。Portal 自动继承 `ThemeProvider`，
  与 `Dialog` 共享模态语义。
- `Confirm`：确认对话框，基于 `Dialog` 叠加固定 footer。提供三种等价形态：`<Confirm>`
  受控组件、`<ConfirmProvider>` + `useConfirm()` hook（返回 `Promise<boolean>`，并发
  latest-wins）、纯函数 `confirm(options): Promise<boolean>`（自挂 React root，SSR 直接
  `resolve(false)`）；`tone="danger"` 直接选择 Button 的 `danger` variant，默认 tone 选择
  `primary`。
- `ThemeProvider`：主题色（accent）与明暗模式（mode）切换包裹层。accent 通过重定义
  `--hn-color-accent` / `--hn-color-accent-hover` / `--hn-focus-ring` 三个 token、mode 通过
  `data-mode` 重定义全套表面/文字/边框 token，经 CSS 级联让子树自动继承，零侵入实现主题
  切换（与 Popover 的 dark/light 同范式）。`accent` 接受预设名（`violet` / `blue` / `teal` /
  `orange` / `pink`，精确下发三件套）或任意 CSS 颜色字符串（hover 与 focusRing 由
  `color-mix` 派生）；`mode` 接受 `'dark'`（默认）/ `'light'`，两轴正交可组合；
  `.hn-theme` 用 `display: contents` 不产生额外盒子，支持嵌套覆盖。

### `Button`

`Button` 的 `danger`、`warning`、`success`、`info` 与 `primary` 同为填充式操作层级，并支持
相同的原生 button 属性、尺寸与禁用状态。`ghost` 是独立的布尔展示属性，可与任意
`variant` 组合；组合后移除表面，并让文字与 hover wash 使用对应操作色：

从旧 API 迁移时，将 `<Button variant="ghost">` 改为 `<Button ghost>`；需要语义色时再同时
传入 `variant`。

```tsx
<Button variant="danger">删除</Button>
<Button variant="warning">覆盖</Button>
<Button variant="success">完成</Button>
<Button variant="info">查看详情</Button>
<Button ghost>取消</Button>
<Button ghost variant="primary">主要文字操作</Button>
<Button ghost variant="danger">危险文字操作</Button>
<Button ghost variant="warning">警告文字操作</Button>
<Button ghost variant="success">成功文字操作</Button>
<Button ghost variant="info">信息文字操作</Button>
```

### `Icon`

`Icon` 是第一期 outline 风格图标集，内置 55 个 24×24 图标：`ICON_NAMES` 常量导出全部
名称，`IconName` 类型从该数组派生（单一数据源）。所有图标遵循统一规范：
`stroke="currentColor"`、stroke-width 1.5、圆角线帽线脚、`fill="none"`，仅用 path /
rect / circle 等基础图元，不依赖外部资源。颜色跟随外层 `color`，尺寸默认 `1em` 见方、
跟随外层 `font-size`，因此天然继承 Button / MenuItem 等宿主组件的文字颜色与字号。
`label` 是可访问名：传入后 svg 标记为 `role="img"` + `aria-label`；不传时输出
`aria-hidden`，屏幕阅读器跳过纯装饰图标。其余原生 svg 属性（`className` / `style` 等）
全部透传：

```tsx
import { Icon, ICON_NAMES } from '@hamster-note/components';

// 装饰图标：屏幕阅读器自动跳过
<Icon name="save" />

// 独立表意时提供可访问名
<Icon name="delete" label="删除" />

// 颜色与尺寸跟随外层
<span style={{ color: 'var(--hn-color-accent)', fontSize: 20 }}>
  <Icon name="search" />
</span>

// 遍历全部图标（Demo 的图标墙即如此渲染）
ICON_NAMES.map((name) => <Icon key={name} name={name} />);
```

### `Popover`

Popover 只负责可复用表面和主题，定位、显示状态、外部点击关闭与焦点返回由使用方根据
`toolbar`、`menu` 或帮助面板等具体模式控制。外框圆角与内嵌 `Button` 的圆角同心衔接
（外框半径 = `--hn-radius-md` + 外框 padding）：

```tsx
<Popover aria-label="文字操作" role="toolbar" theme="light">
  <Button ghost size="small">
    加粗
  </Button>
  <PopoverSeparator />
  <Button ghost size="small">
    添加链接
  </Button>
</Popover>
```

竖排工具条：传入 `orientation="vertical"` 后浮层改为纵向排列，`PopoverSeparator` 会
自动变为水平分隔线并把 `aria-orientation` 同步为 `horizontal`：

```tsx
<Popover aria-label="侧边工具条" orientation="vertical" role="toolbar">
  <Button ghost size="small">
    加粗
  </Button>
  <Button ghost size="small">
    斜体
  </Button>
  <PopoverSeparator />
  <Button ghost size="small">
    链接
  </Button>
</Popover>
```

独立贴边使用：传入 `edge` 后浮层以 `position: fixed` 贴在视口对应边缘，`edgeOffset`
控制与边缘的距离（px，默认 16）。不传 `edge` 时行为与定位完全由使用方控制，不会注入
任何定位样式：

```tsx
<Popover aria-label="贴边操作" edge="top" edgeOffset={24} role="toolbar">
  <Button ghost size="small">
    操作
  </Button>
</Popover>
```

相对贴边：再加 `relative` 后贴边改用 `position: absolute`，浮层贴在**最近的定位祖先**
对应边缘（留在使用方布局上下文内，跟随容器滚动与裁切），而不是 `fixed` 相对视口。
使用方需保证外层容器设置了 `position: relative`（或其他非 static 定位）：

```tsx
<div style={{ position: 'relative', height: 180 }}>
  <Popover aria-label="容器内贴边" edge="bottom" edgeOffset={12} relative role="toolbar">
    <Button ghost size="small">
      操作
    </Button>
  </Popover>
</div>
```

锚点定位：传入 `anchor` 后浮层通过 Portal 渲染到 `document.body` 下，不再受祖先
`overflow` / `transform` / 层叠上下文的裁剪与遮挡影响。浮层以锚点为基准按 `placement`
（默认 `bottom-start`，另有 `top-start` / `top-end` / `bottom-end` / `left-start` /
`right-start`）展开；期望方向溢出视口时自动沿主轴翻转，翻转后仍放不下则 clamp 到
`viewportMargin`（默认 8px）的安全距离内，并跟随滚动 / 缩放 / 尺寸变化重新定位。
`anchorOffset`（默认 6）控制与锚点的间距。显示状态、外部点击关闭与焦点返回仍由使用方
控制（浮层在 body 下，外部点击需在 document 上监听）：

```tsx
const [open, setOpen] = useState(false);
const [anchor, setAnchor] = useState<HTMLElement | null>(null);

<Button
  aria-expanded={open}
  aria-haspopup="dialog"
  onClick={(event) => {
    setAnchor(event.currentTarget);
    setOpen((value) => !value);
  }}
>
  文字
</Button>;
{
  open ? (
    <Popover anchor={anchor} aria-label="文字操作" placement="bottom-start" role="toolbar">
      <Button ghost size="small">
        加粗
      </Button>
      <PopoverSeparator />
      <Button ghost size="small">
        斜体
      </Button>
    </Popover>
  ) : null;
}
```

### `Menu`

`Menu` 提供语义菜单列表，可独立渲染，也可传入 `anchor` 直接作为下拉菜单使用。`MenuItem`
支持 `shortcut` 显示快捷键、`tone="danger"` 标记破坏性操作；`MenuLabel` 用于分组小标题，
`MenuSeparator` 用于分组分隔线：

```tsx
import { Menu, MenuItem, MenuLabel, MenuSeparator } from '@hamster-note/components';

<Menu aria-label="文件操作">
  <MenuLabel>文件</MenuLabel>
  <MenuItem shortcut="⌘N">新建笔记</MenuItem>
  <MenuItem shortcut="F2">重命名</MenuItem>
  <MenuItem disabled>移动到…</MenuItem>
  <MenuSeparator />
  <MenuItem tone="danger">删除</MenuItem>
</Menu>;
```

传入 `anchor` 当作下拉菜单：`Menu` 进入锚定模式——经 Portal 渲染到 `document.body`
下，`.hn-menu` 直接作为浮层表面（自动叠加 `.hn-menu--floating`：边框、阴影与 dark token
覆盖；传 `data-theme="light"` 切换浅色），无需再外套 `Popover`。`placement` /
`anchorOffset` / `anchorCrossOffset` / `viewportMargin` 与 `Popover` 锚定模式语义一致，
同样自动翻转并 clamp 到视口安全距离内。触发按钮需要设置 `aria-haspopup="menu"` 并用
`aria-controls` / `aria-expanded` 连接菜单（显示状态、外部点击关闭与焦点返回仍由使用方
控制，与 `Popover` 哲学一致）：

```tsx
<Button aria-controls="file-menu" aria-expanded={open} aria-haspopup="menu" onClick={toggle}>
  编辑
</Button>;
{
  open ? (
    <Menu anchor={anchorEl} aria-label="编辑操作" id="file-menu" ref={menuRef}>
      <MenuItem shortcut="⌘X">剪切</MenuItem>
      <MenuItem shortcut="⌘C">复制</MenuItem>
      <MenuSeparator />
      <MenuItem tone="danger">清空选中</MenuItem>
    </Menu>
  ) : null;
}
```

### `MenuSubmenu`

`MenuSubmenu` 提供嵌套子菜单能力：trigger 复用 `MenuItem` 的视觉，右侧带 ▸ chevron；panel
即一层锚定模式的 `Menu`（`.hn-menu` 直接作为浮层表面，自带边框 / 阴影与 dark token 覆盖，
不再外套 `Popover`）。panel 经 Portal 渲染到 `document.body` 下，默认向 trigger 右侧展开，
右侧空间不足时自动向左翻转，垂直方向 clamp 在视口安全距离内。鼠标悬停展开（带 150ms 开 /
200ms 关延迟，避免移动缝隙误关），点击 trigger 切换（触屏 fallback）；键盘上
`ArrowRight`/`Enter`/`Space` 进入子菜单并把焦点送到第一个
`menuitem`，`ArrowLeft`/`Escape` 关闭并回焦到 trigger。`label` 为字符串时自动作为子菜单的
`aria-label`，非字符串时可通过 `aria-label` prop 覆盖。`disabled` 时阻止一切展开：

```tsx
import { Menu, MenuItem, MenuSeparator, MenuSubmenu } from '@hamster-note/components';

<Menu aria-label="笔记整理">
  <MenuItem>置顶</MenuItem>
  <MenuSubmenu label="移动到…">
    <MenuItem>收件箱</MenuItem>
    <MenuItem>产品 / 研究</MenuItem>
    <MenuItem>产品 / 规划</MenuItem>
    <MenuSeparator />
    <MenuItem>归档</MenuItem>
  </MenuSubmenu>
  <MenuSubmenu disabled label="添加标签">
    <MenuItem>待处理</MenuItem>
    <MenuItem>进行中</MenuItem>
  </MenuSubmenu>
  <MenuSeparator />
  <MenuItem tone="danger">删除</MenuItem>
</Menu>;
```

已知限制：与现有 `Menu` 一致，不实现完整的 roving-tabindex
箭头导航——焦点进入子菜单后由 `Tab`/`Shift+Tab` 顺序聚焦
各个 `menuitem`。

### `Kbd`

`Kbd` 是纯展示型快捷键键帽组件，无交互、无 `role=button`，适合在文案、菜单项、帮助面板
等场景渲染键帽。`keys` 数组会渲染组合键序列（键帽之间用不带键帽样式的小号 `+` 连接符
拼接）；`children` 渲染单个键帽。`keys` 与 `children` 二选一，`keys` 优先。颜色一律引用
全局 token，嵌入 `Popover` 时自动继承主题覆盖（与 `Menu` 同样的复用哲学）：

```tsx
import { Kbd, Menu, MenuItem } from '@hamster-note/components';

// 单个键帽
<Kbd>⌘</Kbd>
<Kbd>F2</Kbd>

// 组合键
<Kbd keys={['⌘', 'K']} />
<Kbd keys={['⌘', '⇧', 'P']} />
<Kbd keys={['Ctrl', 'Alt', 'Delete']} />

// 嵌入 MenuItem 的 shortcut
<Menu>
  <MenuItem shortcut={<Kbd keys={['⌘', 'N']} />}>新建笔记</MenuItem>
  <MenuItem shortcut={<Kbd>F2</Kbd>}>重命名</MenuItem>
</Menu>
```

### `Loading`

`Loading` 是加载指示器，spinner 为内联 SVG（与 `Icon` 同一套约定：
`stroke="currentColor"`、`fill="none"`、无外部资源），颜色跟随外层 `color` 或
`--hn-color-accent`。`size` 提供 `small` / `medium`（默认）/ `large` 三档，与 Button
的尺寸语义一致。`text` 渲染提示文案，同时作为 `aria-label`（未传时默认「加载中」）；
组件自带 `role="status"`，屏幕阅读器会自动播报状态变化。`text` 与 `children` 二选一
展示在 spinner 旁，`text` 优先；都未传时只渲染 spinner。提供三种使用形态：

- 内联 spinner（默认）：`display: inline-flex`，可嵌在按钮、列表项或正文中；
- 局部覆盖：传入 `cover` 后绝对定位铺满最近的 positioned 祖先（父级需
  `position: relative`），带半透明遮罩居中展示；
- 全屏单例：命令式 `showLoading(options)` / `hideLoading()`，与 `confirm()` 同一模式
  （惰性创建容器 + `createRoot`，SSR 下 no-op 并 `console.warn`）。全局同时至多一个
  实例，重复 `showLoading` 不会创建第二个实例，而是用新 options 重渲染已有实例；
  `showLoading` 返回的 hide 函数与 `hideLoading()` 等价。

```tsx
import { Loading, hideLoading, showLoading } from '@hamster-note/components';

// 内联
<Loading />
<Loading size="small" text="保存中…" />

// 局部覆盖（父级需 position: relative）
<div style={{ position: 'relative', minHeight: 120 }}>
  <Loading cover text="加载笔记…" />
</div>;

// 全屏单例（组件树外也能用）
const hide = showLoading({ text: '同步中…' });
await syncNotes();
hide(); // 或不持有引用时直接调用 hideLoading()
```

### `Dialog`

`Dialog` 是受控模态对话框，经 Portal 渲染到 `document.body` 下，焦点循环、滚动锁、Esc /
背景点击关闭与出入场动画（opacity + 小幅 translateY，180ms transform / 140ms opacity，
尊重 `prefers-reduced-motion`）全部内置；`open` 与 `onClose` 由使用方控制，组件不维护内部
开合状态。传入 `title` / `description` 时自动通过 `aria-labelledby` /
`aria-describedby` 连接到面板；未传 `title` 时使用方需通过 `aria-label` 命名。
`closeOnEsc` / `closeOnBackdrop` 可分别关闭对应退出通道。z-index 1100，高于 Popover 的
1000：

```tsx
import { Button, Dialog } from '@hamster-note/components';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>打开对话框</Button>;
<Dialog
  description="确认把这篇笔记移动到选定的笔记本？移动后原位置将不再保留副本。"
  onClose={() => setOpen(false)}
  open={open}
  title="移动笔记"
>
  <Button onClick={() => setOpen(false)} variant="primary">
    移动
  </Button>
</Dialog>;
```

### `Drawer`

`Drawer` 是边缘贴附的模态抽屉，与 `Dialog` 共享同一套模态语义（受控 `open` / `onClose`、
Portal 到 body、焦点循环、滚动锁、Esc / 背景点击关闭、出入场动画）。`placement` 控制贴靠
边缘与滑入方向（`left` / `right` / `top` / `bottom`，默认 `right`）；左右抽屉默认宽
360px、上下默认高 280px，可用 `size`（px 数字）覆盖。圆角只在远离边缘的两角做处理，制造
「从边缘滑出」的视觉。z-index 1200，高于 Dialog 的 1100，让抽屉内打开 Dialog 时 Dialog
仍可见，而 Dialog 内打开 Drawer 时 Drawer 压在 Dialog 之上：

```tsx
import { Button, Drawer } from '@hamster-note/components';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>打开抽屉</Button>;
<Drawer
  description="右侧滑入的详情面板"
  onClose={() => setOpen(false)}
  open={open}
  placement="right"
  size={420}
  title="笔记详情"
>
  <p>内容区可滚动，承载长表单或详情。</p>
</Drawer>;
```

### `Confirm`

`Confirm` 是确认对话框，基于 `Dialog` 表面叠加固定 footer（ghost 取消 + 语义确认），
提供三种等价形态共用同一展示核心：

- `<Confirm>`：受控组件，使用方持有 `open` 并处理 `onConfirm` / `onCancel`；
- `<ConfirmProvider>` + `useConfirm()`：Provider 在子树外包裹一次，hook 返回
  `confirm(options): Promise<boolean>`（确认 `true` / 取消 `false`），并发采用 latest-wins
  （新请求覆盖旧请求并 resolve `false`）；
- 纯函数 `confirm(options): Promise<boolean>`：在 Provider 树外或非组件代码中调用，内部
  惰性创建容器 + `createRoot`，settle 后卸载清理；SSR 环境下直接 `resolve(false)` 并打
  `console.warn`。

`tone="danger"` 直接选择 `Button` 的 `danger` variant，默认 tone 选择 `primary`，因此确认
按钮与其他操作入口共享同一套语义 token 和交互状态。`loading` 禁用两个按钮并把确认按钮文案
改为「处理中…」：

```tsx
import { Confirm, ConfirmProvider, confirm, useConfirm } from '@hamster-note/components';

// 形态一：受控组件
const [open, setOpen] = useState(false);
<Confirm
  description="删除后无法恢复，该操作不可撤销。"
  confirmText="删除"
  onCancel={() => setOpen(false)}
  onConfirm={() => {
    setOpen(false);
    /* 执行删除 */
  }}
  open={open}
  title="删除笔记？"
  tone="danger"
/>;

// 形态二：Provider + hook
<ConfirmProvider>
  <Inner />
</ConfirmProvider>;
const confirmFn = useConfirm();
const ok = await confirmFn({
  title: '保存修改？',
  description: '未保存的改动将丢失。',
  confirmText: '保存',
});

// 形态三：纯函数（无 Provider 也能用）
const ok2 = await confirm({
  title: '退出登录？',
  description: '需要重新登录后才能继续操作。',
  confirmText: '退出',
  tone: 'danger',
});
```

### `ThemeProvider`

`ThemeProvider` 是主题色（accent）与明暗模式（mode）切换的包裹层。组件库所有组件只引用
全局 token（`--hn-color-accent` / `--hn-color-accent-hover` / `--hn-focus-ring` 以及
`--hn-color-surface` / `--hn-color-text` / `--hn-color-border` 等），ThemeProvider 通过在
包裹层重定义同名 token、经 CSS 级联让子树自动继承，**零侵入**实现主题切换
（与 Popover 的 dark/light 同范式）。`.hn-theme` 用 `display: contents` 让包裹 div
在盒模型上消失，不额外产生一层盒子、不打断外层 flex/grid 布局。

`accent` 与 `mode` 是两个正交轴：accent 重定义 accent 三件套，mode 重定义全套表面与文字
token，两者在同一包裹层上共存（`data-accent` + `data-mode` + 内联 accent style 互不冲突）。

`accent` 接受两种来源：预设名（`violet` / `blue` / `teal` / `orange` / `pink`，从
`THEME_ACCENTS` 读取精确的 accent / accentHover / focusRing 三件套内联下发）或任意 CSS
颜色字符串（只下发主色，hover 与 focusRing 由 CSS `color-mix` 实时派生）。默认 `violet`，
与 `tokens.css` 的默认值一致，不传时视觉无变化。

`mode` 接受 `'dark'`（默认）或 `'light'`，通过 `data-mode` 属性让 theme.css 重定义全套
表面/文字/边框 token。默认 `dark` 与 `tokens.css` 的 :root 默认值一致，不传时视觉无变化。
支持嵌套：内层 ThemeProvider 经级联自然覆盖外层，accent 与 mode 同时生效：

```tsx
import { Button, ThemeProvider } from '@hamster-note/components';

// 预设主题色
<ThemeProvider accent="blue">
  <Button variant="primary">我是蓝色</Button>
</ThemeProvider>

// 自定义颜色（hover 与 focusRing 自动派生）
<ThemeProvider accent="#ff8a3d">
  <Button variant="primary">我是自定义橙色</Button>
</ThemeProvider>

// 明暗模式：mode 与 accent 正交组合
<ThemeProvider mode="light" accent="blue">
  <Button variant="primary">浅色背景 + 蓝色 accent</Button>
</ThemeProvider>

// 嵌套：内层覆盖外层（accent 与 mode 同时生效）
<ThemeProvider mode="light" accent="blue">
  <Button variant="primary">浅色 + 蓝色</Button>
  <ThemeProvider mode="dark" accent="teal">
    <Button variant="primary">深色 + 青绿色</Button>
  </ThemeProvider>
</ThemeProvider>
```

页面级主题：ThemeProvider 用 `display: contents` 不产生盒子，因此页面背景与文字色需要
使用方在 app 根上应用 `background: var(--hn-color-surface); color: var(--hn-color-text);`，
让根 token 经级联铺满整页。

## 命令

| 命令                   | 说明                                                            |
| ---------------------- | --------------------------------------------------------------- |
| `yarn dev`             | 启动 9810 端口的 Vite Demo（监听 `0.0.0.0`，局域网可访问）。    |
| `yarn build`           | typecheck 后按 `vite.lib.config.ts` 构建 npm 组件库到 `dist/`。 |
| `yarn build:demo`      | typecheck 后构建静态 Demo 到 `demo-dist/`。                     |
| `yarn preview`         | 在 9810 端口预览生产版 Demo。                                   |
| `yarn test`            | 运行 Vitest 单元测试。                                          |
| `yarn test:coverage`   | 运行单元测试并输出 V8 覆盖率报告（`coverage/`）。               |
| `yarn test:e2e`        | 运行 Playwright e2e 测试（含视觉快照对比）。                    |
| `yarn test:e2e:update` | 更新 Playwright 视觉快照基线。                                  |
| `yarn typecheck`       | `tsc --noEmit` 类型检查。                                       |
| `yarn lint`            | ESLint 检查（`--max-warnings 0` 零警告门禁）。                  |
| `yarn format`          | Prettier 格式化全部文件。                                       |
| `yarn format:check`    | Prettier 格式检查。                                             |
| `yarn check`           | 依次执行 typecheck、lint、format:check、test 的完整门禁。       |

## 项目结构

```text
├── src/
│   ├── components/        # 13 个组件目录：badge / button / confirm / dialog / drawer /
│   │                      # icon / kbd / loading / menu / note-card / popover / text-field / theme
│   ├── demo/              # 交互式 Demo（每个组件一个展示模块，部署到 GitHub Pages）
│   ├── test/              # Vitest 单元测试与 setup
│   ├── index.ts           # 根入口：导出全部组件与类型
│   └── tokens.css         # 全局设计 token（:root 默认为暗色）
├── e2e/                   # Playwright e2e 测试与视觉快照基线
├── dist/                  # 组件库构建产物（npm 发布内容）
├── demo-dist/             # Demo 构建产物（部署到 GitHub Pages）
├── vite.config.ts         # Demo 开发 / 构建配置
├── vite.lib.config.ts     # 组件库构建配置
├── vitest.config.ts       # 单元测试配置
└── playwright.config.ts   # e2e 测试配置
```

## 测试

单元测试基于 Vitest + @testing-library（jsdom 环境），覆盖组件行为、命令式 API 与主题
级联；e2e 基于 Playwright，对 Demo 做交互回归与视觉快照对比：

```bash
yarn test             # 运行单元测试
yarn test:coverage    # 单元测试 + V8 覆盖率报告
yarn test:e2e         # 运行 Playwright e2e（含视觉快照对比）
yarn test:e2e:update  # 更新视觉快照基线
```

## 开发

```bash
yarn install
yarn dev
```

Demo 默认运行在 `http://localhost:9810`，并监听 `0.0.0.0`，局域网设备可通过开发机 IP
访问。

## GitHub Pages 部署

Demo 通过 `.github/workflows/deploy-demo.yml` 自动部署：推送 main 分支后，workflow 执行
`build:demo` 构建静态站点，再经 `upload-pages-artifact` 上传产物、`deploy-pages` 发布到
GitHub Pages，线上地址 <https://hamsternote.github.io/components/>。

## License

MIT，详见 [LICENSE](./LICENSE)。
