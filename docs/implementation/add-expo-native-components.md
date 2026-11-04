# HAM-163 实施与验收交接

规划提交 `ca0f77f` 与实现分开。Web基线为`ac783da`及npm已发布的0.3.0；原生候选0.1.0-beta.0，Web兼容补丁候选0.3.1。本轮未发布、未合并、未归档。原生组件代码已交付，但不能将静态类型/打包证据视为iOS/Android功能验收。

## 产物与复核

- 原生：`packages/components-native/`，独立manifest/锁文件、ESM与类型、七个公共入口。库编译lib仅ES2022，React/RN/SVG是external peers，无Expo或Web包依赖。
- 宿主：`examples/native/`，Expo54.0.36/RN0.81.5/React19.1.0；SDK54 `expo install`选定SVG15.12.1、safe-area-context约束~5.6.0（具体安装见锁文件）。使用tarball，无库源码alias。
- 共享：`src/shared/`图标几何/名称、主题预设、颜色和数值token。65个图标逐图元/属性对比0.3.0独立基线；Web Button尺寸消费共享数值，通过局部CSS变量映射，保留原class与CSS数值fallback。
- 接入和焦点责任：`packages/components-native/README.md`；相同行为的11组步骤与证据模板：`docs/testing/cross-platform-cases.md`。背景View与Modal分离，宿主按受控open声明背景可访问状态并传safeAreaInsets；输入焦点与读屏焦点分开验证。

原生证据在`docs/implementation/evidence/ham163/`，完整打包产物与日志随issue附件交付：

| 证据                                                                    | 内容与边界                                                                                                                                                |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| consumer-package.json / consumer-package-lock.json / consumer-tree.json | 仓库外新建目录，仅原生tarball+React/RN/SVG的完整安装树，317包；无Web components/react-dom。为类型检查随后另装@types/react工具，不将工具安装混入这份运行图 |
| consumer-entries.ts / consumer-tsconfig.json                            | 根与六个子路径的发布物类型消费，无DOM lib；编译器是工具，解析从隔离消费目录开始                                                                           |
| metro-ios.json / metro-android.json                                     | Expo宿主实际Metro graph，包含模块与完整依赖边；所有七个公共入口进入构建，633/631个宿主模块                                                                |
| metro-audit.json                                                        | 从七个库入口遍历实际graph，iOS535/Android533个库可达模块；零Web components/react-dom/CSS/DOM renderer；React、RN、SVG原生运行路径包含在审计中             |

仓库外干净消费工程的七入口 iOS/Android Metro 实际构建也通过（`consumer-bundles.json`）；只借用 Expo 的构建配置/Babel 工具，Metro、React/RN/SVG 与库运行模块均从干净消费目录解析。类型工具是在运行树证据保存后单独安装。

SVG 根入口会带入 URI/XML fetchData 及未声明的 buffer 依赖；原生构建只导入实际使用的七个 `react-native-svg/src/elements/*` 原生图元，未给消费方增加 buffer 或 Web 包。另提供 browser 条件构建，改用 SVG 公共入口，让 Expo web 选择其受支持的 Web 实现。SVG peer 精确固定15.12.1，升级版本必须重新验证这些发布包内路径及双端图。

图审计明确排除库不可达的Expo宿主工具/冬季全局垫片；RN内部出现Event/window名称不等于DOM渲染器。对实际打包库模块另查DOM API，不能用源码搜索替代图证据。复核：`node scripts/audit-metro.mjs`。重新构建/打包后运行`node scripts/verify-native-consumer.mjs`可重建隔离安装与类型证据。

## 版本兼容与Web结果

完整exports及React/ReactDOM peers与0.3.0相同；根、13个逐组件入口与styles.css全部可解析，CSS映射仍为dist/hamster-note-components.css。候选CSS字节因Button变量映射改变，默认计算值相同；视觉基线不更新。最小Web消费目录安装候选tarball，逐入口类型检查和Vite构建通过，脚本为`node scripts/verify-web-consumer.mjs`。

Web完整检查使用`yarn run check`（Yarn Classic的`yarn check`是其内置依赖一致性命令，另行执行），含类型/lint/格式/84项Vitest。浏览器完整命令为`yarn test:e2e`，覆盖既有用例与新增11个ID；最终结果：`yarn run check` 的84项测试/8个套件、`yarn build` 与 `yarn test:e2e` 的69项全部通过；没有更新快照、跳过或重试用例。新增8项浏览器测试覆盖11个行为ID。真实中文IME候选态和屏幕阅读器不在桌面程序输入证据范围内。

painting使用独立checkout `e97f9fe` / workspace0.8.3，只替换packages/painting/package.json中的components依赖并更新锁文件；业务源码、工具栏未改。候选tarball接入后`pnpm typecheck`、`pnpm build`及layered-toolbar 13/13项Jest均通过。版本、tarball摘要、执行结果在附件日志和汇总文件中。未将消费验证改动提交到painting。

SDK检查有两种结果：已固定的React/RN/SVG/safe-area四项在线`expo install --check`通过；完整在线检查提示Expo自身推荐~54.0.37。按批准基线保留54.0.36，离线bundled metadata检查通过但CLI提示离线检查可靠性限制。本轮不能声称已验证54.0.37或窗口内所有组合。

## 复审修复与 Expo web 实测（2026-11-04）

P2 修复让入焦/回焦回调仅依赖稳定调度器，在 RAF 内读取最新 initial/trigger/fallback refs；替换 ref 不再清零 Modal 的 shown/laidOut 或取消回焦帧。开合重置移至布局阶段，先于 RN Web Modal 子组件 passive effect 的 onShow。`packages/components-native/test/popover-focus.test.mjs` 使用真实 React hooks、实际 Popover/focus 源码及模拟 RN 事件/RAF；两条审核时序在旧实现上均失败，修复后连同目标替换、iOS dismiss、卸载清理、Web 缺失 API 分支共 **7/7** 通过。测试使用仓库开发工具，不给原生包添加 DOM 运行依赖；CI 运行 `yarn test:native`。

Expo web 修复：七入口增加 browser 条件 JS，SVG 通过公共入口解析到 `ReactNativeSVG.web.js`，原生仍使用七图元；背景不再调用 setNativeProps，改由宿主用受控 open 声明 accessibilityElementsHidden/importantForAccessibility；Keyboard.metrics 先做能力探测；浏览器回焦直接使用组件 ref 的 focus，原生仍使用挂载句柄和 AccessibilityInfo。未发布候选的 backgroundRef 参数已移除，接入迁移见包 README。示例只增加 react-dom19.1.0、react-native-web~~0.21.0、@expo/metro-runtime~~6.1.2；这些依赖未进入库 manifest。没有 web-polyfills.js、SVG shim 或 Metro resolveRequest 重定向。

安装最终 tarball 后，在独立端口以 `CI=false BROWSER=none npx expo start --web --port 5292 --host localhost --max-workers 2 --clear` 重启，执行 `node scripts/test-expo-web.mjs http://127.0.0.1:5292`。Chromium 真实浏览器验证通过：按钮计数和中文字符串输入、66个SVG（65名称+装饰）、菜单首次入焦/子级进入与返回/叶子只回调一次、可见关闭和Esc回触发器、Popover命名标题入焦、触发器移除后回后备目标。结果为零 console/page error、零500响应；日志、menu/popover截图随本轮附件交付。该5292实例验后已停止；其他操作员的5290实例未改动，需要拉取新提交后重启。

`expo export --platform web` 成功，实际图含249模块，七入口均来自 dist-web，无 Fabric/codegenNativeComponent 路径；Web export 已纳入原生CI。原生无DOM类型检查、构建、宿主类型检查及双端 export 也通过；重新打包后的干净消费树仍317包、七入口双端构建通过，实际图仍iOS633/库可达535、Android631/533，禁止路径为空。原始图/树、焦点测试前后输出、浏览器结果和新tarball SHA256已更新到证据目录。

这次 Expo web 是针对上述缺陷的 Chromium 冒烟验证，未覆盖 Safari、真实IME候选态、浏览器读屏或完整方向键菜单导航；原生读屏、系统返回、软键盘仍需真机，不能由这些结果补勾。已有 Web 包的69项浏览器回归及 painting13项结果是上一实现的独立记录；本次没有修改其产品源码。任务勾选仍 **13/24**，4.5 / 5.3 / 5.4 阻塞不变。

仓库内证据的 `summary.json` 记录检查结果和任务勾选，`checksums.json` 提供最终两个候选tarball及各份原始证据的SHA256；完整日志和tarball由issue附件交付。任务当前13/24勾选；2.2–3.4八项实现含在PR，但验收部分仍待设备，不以静态检查补勾。

## 发布与确切阻塞

4.5 **发布阻塞**：2026-11-04官方npm registry查询新包返回404（仅能确认当前不可查询到发布记录，不足以保证包名可注册）；`npm whoami`为ENEEDAUTH，维护者scope发布权限未证实。GitHub可见仓库secret列表为空，没有npm-native environment（仅github-pages）；需发布角色落实scope授权、NPM_TOKEN与环境审批，禁止本轮真实发布。记录仅含名称/状态，没有秘密值。

5.3 **iOS真机阻塞**：缺设备、操作员、VoiceOver/中文软键盘/系统退出及回焦证据。

5.4 **Android真机阻塞**：缺设备、操作员、TalkBack/中文软键盘/系统返回及键盘窗口变化证据。

2.2–3.4的原生代码已实现；这些任务还明确要求宿主观察或读屏检查，本轮未运行原生设备，因此仍保留未勾。请设备操作员按同一11组用例补齐后更新，不能只勾5.3/5.4却省略对应组件检查。当前只能交付实现和构建结果，不宣布原生行为、三端矩阵通过。

| ID                    | Web                    | iOS真机 | Android真机 |
| --------------------- | ---------------------- | ------- | ----------- |
| B01 / B02             | 通过（Chromium自动化） | 待执行  | 待执行      |
| I01                   | 通过（Chromium自动化） | 待执行  | 待执行      |
| T01 / T02             | 通过（Chromium自动化） | 待执行  | 待执行      |
| P01 / P02 / P03 / P04 | 通过（Chromium自动化） | 待执行  | 待执行      |
| H01 / H02             | 通过（Chromium自动化） | 待执行  | 待执行      |

## 发布顺序与回退

Web共享数据抽取需要0.3.1兼容补丁；根包非private，现有v*发布路由与所有导出保留。原生独立native-v0.1.0-beta.0→beta；新增workflow严格校验manifest/name/tag，beta不推进latest。分类/错版本/错包/错标签离线9项测试通过。稳定latest只允许手工触发且提供三端验收链接，并经过npm-native环境；发布角色必须先配置保护规则。beta安装不能替代最终真机验收，验收前禁止稳定推广。

推荐先完成代码评审与设备矩阵、落实发布权限，再由发布角色发Web补丁和原生beta；稳定版0.1.0在三端必要项通过后发布。每包独立版本，不覆盖已发布版本。Web回退固定0.3.0；原生首发前可移除接入，后续固定此前验证过的版本。PencilKit、painting工具栏、HAM-164不在范围，也不能为此处缺失的真机证据背书。
