# Design

## Context

动机见 proposal.md。源码基线 `ac783da` / `0.3.0`：根包及 13 个组件子路径由 `vite.lib.config.ts` 构建，`styles.css` 映射到 `dist/hamster-note-components.css`；react 与 react-dom 都是强制 peer。Button/TextField 暴露 HTML 属性，Popover/MenuSurface 直接 import `createPortal`，Icon 的路径表是 DOM SVG JSX。`src/tokens.css` 默认深色，ThemeProvider 用 CSS 级联局部覆盖；颜色预设在 `theme.ts`，尺寸分散于各组件 CSS。现有 MenuSubmenu 支持点击/悬停及右进、左出/Esc 回焦，但明确没有完整 roving-tabindex；不能将理想化 APG 行为误述为现状。

测试现状：Vitest 是 jsdom；Playwright 仅 Chromium，不代表 iOS/Android 原生。发布工作流按 `v*` 标签读取根 package.json、构建根包并 npm publish。现有 ADR 0001 已允许 Pro 与基础组件独立版本，但没有规定原生包策略。本提案不修改 Pro 边界。

## Goals / Non-Goals

**Goals:** 原生消费方只安装原生包和必要 peers；共享可审计的数据与行为契约，平台渲染器各自使用原语；发布物可脱离仓库安装；Web 使用方无需改 import 或 CSS 引入方式。

**Non-Goals:** 不将 HTML props 一比一透传给 RN，不用 Expo DOM/WebView 冒充原生，不为 Web 增补完整菜单键盘系统，不移植其余组件，不进入业务工具栏或 PencilKit；本阶段只产出文档与 OpenSpec 初始化配置。

## Decisions

### 1. 仓库与包边界

规划根确定为 components 仓库的 `openspec/`；初始化命令为 `openspec init --tools codex --language zh --no-animation`，遵循其生成的 spec-driven schema 与 `.agents/skills/openspec-propose/`。本地配置不声明 store，不将本需求塞入 painting 的规格。

选择 `packages/components-native/` 独立包 `@hamster-note/components-native`，根包保持当前路径和发布身份。初期使用独立 package.json、独立锁文件/安装目录和显式 `yarn --cwd` 命令，不启用要求根包 private 的 Yarn Classic workspaces，避免破坏根包发布。`examples/native/` 是不发布的 Expo 验收宿主，通过打包 tarball 安装原生包；不通过源码 alias 绕过 exports。

单包多入口虽可复用版本号，但 `react-native` 条件只影响选中的代码入口，不能消除安装器对强制 react-dom peer 的解析；将该 peer 改为 optional 又会改变既有 Web 安装契约。因此拒绝该方案。拆包新增发布维护成本，但依赖隔离可直接检查。原生 manifest 的 dependencies/peer/optional 均不得引用 Web 包或 react-dom，也不经 Pro 间接引用它们。

原生包提供根入口与 `./button`、`./icon`、`./popover`、`./menu`、`./text-field`、`./theme`，每个入口都有 types 和 JS，导出的都是 RN 实现。Web 名称相似仅表示语义相近，不承诺 props 类型相同。新包仅承诺 iOS/Android；三端共用用例的 Web 端使用原 Web 包，不额外承诺 RN Web 渲染器。开发构建建议 tsup 生成 ESM 与声明并内联纯共享数据，React/RN/react-native-svg external，原生类型构建不包含 DOM lib；根 Vite 保持 Web 职责。

### 2. 首期版本与依赖证明

2026-11-04 实际查询 `npm view expo-template-blank@sdk-57 version dependencies --json` 得到模板 `57.0.33`，依赖 Expo `~57.0.31`、React `19.2.3`、RN `0.86.3`。用户明确指定SDK57（2026-11-04），所以用此模板和expo@57.0.31的bundledNativeModules重新确定兼容基线，替代初始提案选择；即使latest已是58，也不擅自越过用户指定版本：

| 对象 | 提案支持区间 | 验收锁定基线 |
| --- | --- | --- |
| Expo 宿主 | `>=57.0.31 <58.0.0` | `57.0.31` |
| RN peer | `>=0.86.3 <0.87.0` | `0.86.3` |
| React peer | `>=19.2.3 <19.3.0` | `19.2.3` |
| react-native-svg peer | `15.15.4`（原生图元深路径需精确锁定） | `15.15.4` |
| Web 包 peers | 保留现状 `react ^19.0.0`、`react-dom ^19.0.0` | 根锁文件当前组合 |

Expo 是验收宿主依赖，不是库运行时 peer；库无需调用 Expo API。更高 SDK/RN/React 不在本轮声明中，区间内 patch 更新须在发布候选锁文件下重跑矩阵，不声称验证了区间所有排列。SDK57由用户指定，RN0.86/React19.2来自该SDK的模板配对；只声明此minor窗口以控制未验证组合。安装锁定版本通过不能代替真机行为验收；接入窗口外宿主需修订约束并重验。

依赖证据分两层：①干净临时消费项目只装原生 tarball、React/RN/SVG peers，用安装器依赖树/锁文件核查无 Web 包、react-dom；②以 Metro 对全部公共原生入口导出 iOS/Android bundle，保存实际解析模块清单，检查库可达图无 `react-dom`、CSS、HTML/SVG DOM 渲染器和 `document/window` DOM API。不能以 grep 源码或成功构建单个 Button 代替全入口检查。仓库 Web 开发依赖可以有 react-dom，不能拿混合开发根目录的依赖树当原生发布图。RN 自身的平台全局与宿主工具不等同于库引入的 DOM 运行时；报告需明确检查边界。

### 3. 原语与公开 API 映射

| 语义 | 现有 Web API | 原生 API 与实现方向 |
| --- | --- | --- |
| Button | children、variant、size、ghost、disabled、onClick、HTML attrs | 相同样式语义；onPress、accessibilityLabel、accessibilityState、style、host ref；Pressable + Text；字符串自动包 Text，其他 children 须为 RN 节点；ghost 旧 variant 别名也保留 |
| Icon | name、label、CSS/SVG attrs | name、label、size、color、style；react-native-svg 的 Svg/Path 等，无 DOM；name 集及 24×24/1.5 描边几何保持 |
| TextField | label、hint、error、input props | label、hint、error、value/defaultValue、onChangeText、disabled、secureTextEntry、keyboardType、ref；View/Text/TextInput；不接受 HTML event |
| Popover | 展示表面；anchor 为 HTMLElement，开合由调用方处理 | 受控 open/onClose、anchorRef、placement、anchorOffset、viewportMargin、triggerRef、fallbackFocusRef、accessibilityLabel；RN Modal + View，锚点 measureInWindow，无锚点时居中 |
| Menu | Menu/Item/Label/Separator/Submenu，HTML attrs | 同名组合和 tone、disabled、shortcut 展示语义；Item onPress；顶层受控开合，子菜单点击进入；不要求悬停；返回先退子级 |

原生 overlay 使用一个 Modal 承载同一菜单树，按层级维护当前面板与返回路径，避免堆叠多个 Modal 引起回焦/读屏穿透。菜单选择叶子项后只触发一次回调、关闭整棵树；子级返回只回父触发项。Popover 通用内容不强制自动关闭；Menu 的选择关闭由其自身协调。锚点布局、窗口尺寸、安全区或键盘可用区域变化后重新测量，先翻转再 clamp，面板过高时内部滚动；关闭/卸载清理监听和待执行焦点操作。

### 4. 焦点、无障碍与主题

Button/MenuItem 用 Pressable，分别声明 `accessibilityRole="button"/"menuitem"`，disabled 状态阻止回调并播报；子菜单触发器声明 expanded。图标有 label 时为 image，无 label 为装饰且不单独读出，带图标按钮由按钮命名避免双重播报。TextInput 直接获得 label/hint，error 替代 hint 并通过原生读屏公告机制播报；使用 `accessibilityLabel`/`accessibilityHint` 兼容 iOS，Android 可补 label 关联。disabled 映射 editable=false，ref 暴露 focus/blur，普通文本输入与读屏焦点分别管理。

打开 Modal 后在内容已布局且 `onShow` 完成时，把 VoiceOver/TalkBack 焦点移至首个可用项，空菜单移至命名标题。使用 AccessibilityInfo.setAccessibilityFocus 与挂载节点句柄，设置 accessibilityViewIsModal、隐藏背景可访问节点；关闭时还原背景后将读屏焦点送回 triggerRef，触发器已卸载则送 fallbackFocusRef，无可用目标时不调用失效句柄、不强行聚焦隐藏元素。原生输入焦点仅对 TextInput 调用 focus；不声称 setAccessibilityFocus 等于硬件键盘 focus。支持焦点方法的平台控件同时调用其焦点方法，硬件键盘结果需单独记录，首期不保证完整原生方向键菜单导航。

遮罩点按、可见关闭按钮、iOS 无障碍 escape 与 Android `onRequestClose` 共用单次关闭路径；子菜单先返回父级。系统读屏、键盘输入、窗口变化时均不得丢失输入值。Web 保留现有 ARIA 和子菜单键盘回焦实现；共用 Web fixture 包装现有表面完成受控开合，不把原 Web Popover 本无的焦点管理当成回归缺陷。

建立 `src/shared/` 纯 TS 数据：图标路径描述、主题预设与平台无关 token，不导入 React、DOM 或 CSS；两种构建各自内联，无共享运行时包依赖。Web 从数据重建原 SVG/CSS，现有 exports、DOM 属性、默认颜色及页面样式不变。原生主题 Context 默认 dark/violet，可嵌套，Modal 显式携带当前主题；字体使用系统字体回退。现有颜色/圆角忠实映射；将组件已存在的 spacing/fontSize 提为命名数值（如按钮 gap 8、padding 11/14/18、字号 12/13/14，TextField gap 7），原生使用 dp，字号允许系统缩放；层级定义 popover/menu 1000 的语义层而非假设 zIndex 跨 Modal 生效。RN 不解析 CSS var/color-mix/字体栈；自定义原生 accent 首期接受 #RRGGBB 或显式三色对象，用 sRGB 混合派生状态色，Web 继续接受原有任意 CSS 颜色。按压反馈与原生最小 44dp 触达区（必要时 hitSlop）允许平台差异，不以 Web 30px 按钮命中区限制原生可访问性。

### 5. 同一套行为用例与证据

选择**各端手工清单 + 已有 Web 自动化**，不在首期引入 Jest/RNTL、Detox 或 Maestro。后者可作为独立增强，但 jsdom 和 Playwright 不能证明原生焦点、键盘或辅助技术行为。后续实现将以下 ID 落为 `docs/testing/cross-platform-cases.md`，Web fixture 和 Expo fixture 读取同一套示例数据，呈现回调计数/文本值/开合状态供人工核验。相同行为结果跨端一致，输入手段和角色映射按平台记录。

| ID | 三端共同行为步骤与预期 | 原生特别检查 |
| --- | --- | --- |
| B01 | 启用按钮激活一次，计数仅+1；禁用后激活计数不变 | 点击/读屏激活；disabled 播报 |
| B02 | 六种 variant、三种 size、ghost 与旧 ghost 别名均有可辨状态 | 触达区、文本缩放 |
| I01 | 遍历全部 ICON_NAMES；名称/几何对应；带 label 可读、装饰图标不重复读出 | 真正 SVG 原生路径、尺寸颜色 |
| T01 | 受控/非受控输入中文，更新值与回调，失焦后值不丢失 | 中文键盘、键盘遮挡、focus/blur |
| T02 | label 始终可见，error 优先 hint，禁用不能编辑 | VoiceOver/TalkBack 可读出错误 |
| P01 | 打开弹层、取消/遮罩关闭，回到触发点；禁用项不可选 | 读屏焦点、Android Back/iOS escape |
| P02 | 选择菜单叶子项，仅回调一次且关闭；子菜单可进入、返回父项 | 触屏路径及 expanded 状态 |
| P03 | 屏幕边缘开弹层后调整窗口/键盘，内容可见可滚动且不越安全区 | 旋转、软键盘、层级无遮挡 |
| P04 | 打开后移除触发器或卸载弹层，不聚焦已卸载节点、不再触发回调 | fallback 存在/不存在两种情况 |
| H01 | dark/light × 五个预设；嵌套内层改变不影响外层或宿主 | Modal 继承、系统字号 |
| H02 | 自定义 accent 与数值 token 覆盖生效，仅影响对应子树 | 原生支持格式；Web CSS 格式照旧 |

三端逐 ID 执行并记录结果，Web 可填 Playwright 用例链接与运行结果；未有自动化覆盖的项同样手工。Web 现有键盘/ARIA/视觉回归额外保留；原生系统返回/读屏属于同一 P/T 用例的平台步骤，不标为“不适用”来规避。证据模板含设备型号、OS、SDK/RN/React 精确版本、包版本、输入方式、步骤、预期/实际、截图/录屏路径、执行者/日期；读屏焦点须录屏/操作记录，截图不能单独证明。最低 iOS 真机、Android 真机各一台，Web Chromium；模拟器可补充而不可替代原生设备与读屏验收。设备未就绪可完成实现交接，但不得标记功能验收通过或推广稳定发布。

### 6. 发布与 Web 回归

保留根 workflow 的 `v*` 路由与根版本校验，新增独立原生 workflow 只接受 `native-v*`，校验 `packages/components-native/package.json` 的版本，在该目录构建/pack/发布。两个 workflow 均禁止错误标签发布另一个包，默认不让原生标签触发根 publish。原生先 `0.1.0-beta.0` 发 beta，再 `0.1.0` 发 latest；新包独立演进，遵循版本不可覆盖。不能复用原 workflow 对未知 prerelease 自动走 latest 的分支逻辑；原生仅稳定版 latest、beta 版 beta，其余预发布拒绝或显式指定受限标签。

发布前比较 `0.3.0` 与候选 Web 包的完整 exports、类型消费、CSS 路径及 Web 测试；全部根/子路径保留，不删除/重定向 `styles.css`。painting 使用候选 tarball 在独立消费方 checkout 做既有构建与 Icon 行为回归，不改其工具栏，不在本 change 引入 painting 源码补丁。无法拿到消费方或设备证据时记录未完成项，不能由组件库 Demo 替代结论。

## Risks / Trade-offs

- [双渲染器漂移] → 纯数据单源、相同 ID 清单与发布候选矩阵；不承诺像素完全相同。
- [原生包误引入根 barrel、CSS 或 react-dom peer] → 干净安装图 + 全入口 Metro 模块图双重门禁，检查打包产物而非仅源码。
- [Modal 关闭后读屏焦点丢失] → onShow/布局后聚焦、关闭后背景恢复、失效句柄守卫与真机读屏验证；未通过不发稳定版。
- [旧 SDK 目标与真实宿主不匹配] → 明示仅 SDK57 支持窗口；用户要求升级时同步修订规格、安装树和三目标模块图；升级宿主窗口必须重新验证。
- [新增 npm 包名或发布权限尚未验证] → 实施阶段打包前核对可用性和发布配置；不得请求/记录秘密值，权限缺口作为发布阻塞。
- [Linux 无法完成 iOS 设备验收] → 由后续设备操作员提供本组件库的证据；HAM-164 与 PencilKit 结果不能代替本矩阵，也不要求本轮执行 Mac 操作。

## Migration Plan

先实现独立原生包与宿主，保持 Web 包可独立构建；共享数据抽取后跑完整 Web 回归和 painting 消费验证，再完成原生 tarball/Metro/真机矩阵。按各包独立版本发布，原生消费者显式安装新包并按映射更换 props；Web 消费者 import 不变。回退为原生消费者固定此前已验证版本或移除新增接入，Web 如发补丁则固定 `0.3.0`；已发布版本不覆盖、不删包。发布、升级消费者和 apply 均是后续工作。

## Open Questions

不影响本提案架构的待落实项：原生验收设备/操作员与执行日期、新包 npm 发布权限、SDK57锁定组合的原生真机行为。以上在对应实施任务中记录；当前不把它们描述为已就绪，也不阻塞文档评审。
