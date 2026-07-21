# @hamster-note/components

HamsterNote 的 React 19 基础组件库，使用 TypeScript 6 与 Vite 8 构建。

## 开发

```bash
yarn install
yarn dev
```

Demo 默认运行在 `http://localhost:9810`，并监听 `0.0.0.0`，局域网设备可通过开发机 IP
访问。

## 使用

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

Popover 只负责可复用表面和主题，定位、显示状态、外部点击关闭与焦点返回由使用方根据
`toolbar`、`menu` 或帮助面板等具体模式控制。外框圆角与内嵌 `Button` 的圆角同心衔接
（外框半径 = `--hn-radius-md` + 外框 padding）：

```tsx
<Popover aria-label="文字操作" role="toolbar" theme="light">
  <Button size="small" variant="ghost">
    加粗
  </Button>
  <PopoverSeparator />
  <Button size="small" variant="ghost">
    添加链接
  </Button>
</Popover>
```

竖排工具条：传入 `orientation="vertical"` 后浮层改为纵向排列，`PopoverSeparator` 会
自动变为水平分隔线并把 `aria-orientation` 同步为 `horizontal`：

```tsx
<Popover aria-label="侧边工具条" orientation="vertical" role="toolbar">
  <Button size="small" variant="ghost">
    加粗
  </Button>
  <Button size="small" variant="ghost">
    斜体
  </Button>
  <PopoverSeparator />
  <Button size="small" variant="ghost">
    链接
  </Button>
</Popover>
```

独立贴边使用：传入 `edge` 后浮层以 `position: fixed` 贴在视口对应边缘，`edgeOffset`
控制与边缘的距离（px，默认 16）。不传 `edge` 时行为与定位完全由使用方控制，不会注入
任何定位样式：

```tsx
<Popover aria-label="贴边操作" edge="top" edgeOffset={24} role="toolbar">
  <Button size="small" variant="ghost">
    操作
  </Button>
</Popover>
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
  aria-haspopup="menu"
  onClick={(event) => {
    setAnchor(event.currentTarget);
    setOpen((value) => !value);
  }}
>
  编辑
</Button>;
{
  open ? (
    <Popover anchor={anchor} placement="bottom-start">
      <Menu>
        <MenuItem shortcut="⌘X">剪切</MenuItem>
        <MenuItem shortcut="⌘C">复制</MenuItem>
      </Menu>
    </Popover>
  ) : null;
}
```

`Menu` 提供语义菜单列表，可独立渲染，也可嵌入 `Popover` 当作下拉菜单使用。`MenuItem`
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

嵌入 `Popover` 当作下拉菜单：`Menu` 复用全局颜色 token，自动继承 `Popover` 的 dark/light
主题，无需任何主题 prop。触发按钮需要设置 `aria-haspopup="menu"` 并用 `aria-controls` /
`aria-expanded` 连接浮层（显示状态由使用方控制，与 `Popover` 哲学一致）。下拉菜单推荐
配合 `anchor` 使用（见上文锚点定位），让菜单渲染到 body 下并自动躲避视口边缘：

```tsx
<Button aria-controls="file-menu" aria-expanded={open} aria-haspopup="menu" onClick={toggle}>
  编辑
</Button>;
{
  open ? (
    <Popover anchor={anchorEl} aria-label="编辑操作" id="file-menu">
      <Menu>
        <MenuItem shortcut="⌘X">剪切</MenuItem>
        <MenuItem shortcut="⌘C">复制</MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger">清空选中</MenuItem>
      </Menu>
    </Popover>
  ) : null;
}
```

`MenuSubmenu` 提供嵌套子菜单能力：trigger 复用 `MenuItem` 的视觉，右侧带 ▸ chevron；panel
复用 `Popover` 作为表面（自动继承 dark/light 主题，与 `Menu` 同样的复用哲学），内部再嵌一层
`Menu` 承载子项。panel 经 Portal 渲染到 `document.body` 下，默认向 trigger 右侧展开，
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

也可以使用支持 tree-shaking 的独立入口：

```tsx
import { Button } from '@hamster-note/components/button';
import '@hamster-note/components/styles.css';
```

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

`Confirm` 是确认对话框，基于 `Dialog` 表面叠加固定 footer（ghost 取消 + primary 确认），
提供三种等价形态共用同一展示核心：

- `<Confirm>`：受控组件，使用方持有 `open` 并处理 `onConfirm` / `onCancel`；
- `<ConfirmProvider>` + `useConfirm()`：Provider 在子树外包裹一次，hook 返回
  `confirm(options): Promise<boolean>`（确认 `true` / 取消 `false`），并发采用 latest-wins
  （新请求覆盖旧请求并 resolve `false`）；
- 纯函数 `confirm(options): Promise<boolean>`：在 Provider 树外或非组件代码中调用，内部
  惰性创建容器 + `createRoot`，settle 后卸载清理；SSR 环境下直接 `resolve(false)` 并打
  `console.warn`。

`tone="danger"` 通过 `data-tone='danger'` 挂在 footer 上，CSS 局部覆盖确认按钮背景为
`--hn-color-danger`，不修改 `Button`。`loading` 禁用两个按钮并把确认按钮文案改为「处理中…」：

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

- `yarn dev`：启动 9810 端口的 Vite Demo。
- `yarn build`：构建 npm 组件库到 `dist/`。
- `yarn build:demo`：构建静态 Demo 到 `demo-dist/`。
- `yarn run check`：执行 TypeScript、ESLint 与 Prettier 门禁。
- `yarn preview`：在 9810 端口预览生产版 Demo。

## 组件

- `Button`：primary、secondary、ghost 三种层级与三种尺寸。
- `Badge`：neutral、accent、success、warning、danger 五种语义状态。
- `TextField`：持久标签、辅助信息、错误状态与完整原生 input 属性。
- `NoteCard`：静态语义文章或带选择状态的交互卡片。
- `Popover`：支持 `dark`（默认）与 `light` 主题的通用浮层表面，搭配语义化
  `PopoverSeparator` 分组内容；`anchor` 模式下经 Portal 渲染到 body 并自动躲避视口边缘。
- `Menu`：`role="menu"` 语义菜单列表，含 `MenuItem`（支持 `shortcut` 与 `danger` tone）、
  `MenuLabel`、`MenuSeparator` 与 `MenuSubmenu`（嵌套子菜单，panel 渲染到 body 下、
  右侧不足自动左翻，复用 `Popover` 作为表面自动继承主题），可独立使用或嵌入 `Popover`
  自动继承主题。
- `Kbd`：纯展示型快捷键键帽组件。`keys` 渲染组合键序列（键帽间用小号 `+` 连接符拼接），
  `children` 渲染单个键帽；颜色一律引用全局 token，嵌入 `Popover` 自动继承主题。
- `Dialog`：受控模态对话框。Portal 渲染到 `document.body`，内置焦点循环、滚动锁、Esc /
  背景点击关闭与出入场动画（尊重 `prefers-reduced-motion`）；`open` / `onClose` 由使用方
  控制，`title` / `description` 经 `aria-labelledby` / `aria-describedby` 连接面板。
- `Drawer`：边缘贴附模态抽屉。`placement` 支持 `left` / `right` / `top` / `bottom`
  （默认 `right`），`size` 覆盖默认尺寸（左右 360 / 上下 280）；与 `Dialog` 共享模态语义，
  圆角只在远离边缘的两角做处理，z-index 1200 高于 Dialog 以支持嵌套组合。
- `Confirm`：确认对话框，基于 `Dialog` 叠加固定 footer。提供三种等价形态：`<Confirm>`
  受控组件、`<ConfirmProvider>` + `useConfirm()` hook（返回 `Promise<boolean>`，并发
  latest-wins）、纯函数 `confirm(options): Promise<boolean>`（自挂 React root，SSR 直接
  `resolve(false)`）；`tone="danger"` 通过 `data-tone` 局部覆盖确认按钮色，不修改 Button。
- `ThemeProvider`：主题色（accent）与明暗模式（mode）切换包裹层。accent 通过重定义
  `--hn-color-accent` / `--hn-color-accent-hover` / `--hn-focus-ring` 三个 token、mode 通过
  `data-mode` 重定义全套表面/文字/边框 token，经 CSS 级联让子树自动继承，零侵入实现主题
  切换（与 Popover 的 dark/light 同范式）。`accent` 接受预设名（`violet` / `blue` / `teal` /
  `orange` / `pink`，精确下发三件套）或任意 CSS 颜色字符串（hover 与 focusRing 由
  `color-mix` 派生）；`mode` 接受 `'dark'`（默认）/ `'light'`，两轴正交可组合；
  `.hn-theme` 用 `display: contents` 不产生额外盒子，支持嵌套覆盖。
