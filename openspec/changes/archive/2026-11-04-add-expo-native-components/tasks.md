# Tasks

## 1. 包结构与可复现宿主

- [x] 1.1 建立 `packages/components-native/` 独立 manifest、锁文件、构建和类型配置，声明设计中的 React/RN/SVG peers 与全部公共入口；以独立目录安装、构建、类型消费验证成功，根包仍非 private 且保持原发布身份。
- [x] 1.2 建立 `examples/native/` 私有 Expo SDK57 宿主，固定 Expo57.0.31/RN0.86.3/React19.2.3；使用 SDK57 的 `expo install` 解析 SVG 并记录精确版本及兼容范围，以 Expo 依赖兼容检查和 iOS/Android bundle 成功验证。
- [x] 1.3 将 design 的 B01–H02 共 11 个行为 ID、统一示例数据与证据模板落到 `docs/testing/cross-platform-cases.md` 及 fixtures；核对每 ID 有三端步骤、可见状态/计数、预期和证据字段，并记录原生设备/操作员待落实项，不预填通过。

## 2. 基础控件与 token

- [x] 2.1 从 `src/components/icon/Icon.tsx`、`theme/theme.ts`、tokens 与组件 CSS 抽取 `src/shared/` 纯图标/主题/尺寸数据，由 Web 构建消费并由原生构建内联；以全名称几何比对、既有 Web 图标/主题单测及视觉快照验证不变，共享模块无 React/DOM/CSS imports。
- [ ] 2.2 实现原生 ThemeProvider、数值 token、五预设和自定义色支持，Modal 可显式继承；用 H01/H02 观察 dark/light、嵌套、局部覆盖、字号缩放和宿主不受影响，记录全部 token 类别映射。
- [ ] 2.3 实现 RN Button 的 variant/size/ghost/旧别名、Pressable 回调、disabled/label/state 与触达区；用 B01/B02 在宿主观察计数、禁用、状态色、44dp 触达与读屏语义。
- [ ] 2.4 用 react-native-svg 实现 Icon 与所有名称，提供大小/颜色/label；按 I01 检查每个图标几何、原生渲染路径与装饰不重复播报，不从 Web Icon 重导出。
- [ ] 2.5 实现 TextField 的 TextInput、label/hint/error、受控/非受控、disabled、onChangeText 与 ref focus/blur；按 T01/T02 验证中文值保留、错误优先、不可编辑及读屏提示。

## 3. 弹层、菜单与焦点

- [ ] 3.1 实现 Popover 受控 Modal 表面与锚点测量，提供无锚点居中、placement/offset/margin、安全区与键盘区域适配；按 P03 验证边缘翻转、旋转重测量、超高内容滚动和无遮挡。
- [ ] 3.2 实现 Menu/Item/Label/Separator/Submenu，在同一 Modal 管理菜单路径；按 P02 验证触屏进入、禁用拒绝激活、子级返回父项及叶子回调仅一次且关闭整树。
- [ ] 3.3 实现可访问角色/expanded/disabled、onShow 后入焦、背景隔离与退出回焦，区分 TextInput 输入焦点和读屏焦点；按 P01 用 VoiceOver/TalkBack 检查打开、取消、遮罩、可见关闭、iOS escape/Android 返回，不以截图替代焦点路径证据。
- [ ] 3.4 实现 triggerRef/fallbackFocusRef 挂载有效性检查、关闭单次通知及测量/聚焦任务卸载清理；按 P04 验证触发器消失、后备有/无、整个弹层卸载后均无失效聚焦或迟到回调。

## 4. 发布产物与依赖边界

- [x] 4.1 打包原生 tarball，核查 files 与根及六个子路径的 JS/声明，配置独立类型检查不使用 DOM lib；在仓库外干净 RN 消费目录逐入口导入和构建，验证无源码相对路径逃逸或未打包共享文件。
- [x] 4.2 在该干净消费项目仅安装原生 tarball 及 peers，交付完整安装树/锁文件；验证无 Web 包、react-dom 或间接引入它们的依赖，并保存安装器 peer 解析结果，不以仓库根开发依赖图代替。
- [x] 4.3 令宿主使用全部原生公共入口输出 iOS/Android Metro bundle 与实际模块清单，审计库可达模块无 DOM/CSS/ReactDOM 渲染路径并交付报告；说明宿主工具与库运行图的边界，不以单组件构建或源码搜索代替证明。
- [x] 4.4 为原生新增 `native-v*` 独立发布 workflow、manifest/tag 版本校验与 beta/latest 分类，保留根 `v*` 流程；用标签分类/版本不匹配/错误目标包的离线验证或 dry-run 证明只选中对应包，beta 不改 latest，本任务不要求真实发布。
- [ ] 4.5 核实新包名称可用性和维护者发布权限，以不含秘密值的准备记录交付；若缺权限明确标为发布阻塞，后续由发布角色执行 `0.1.0-beta.0`，三端验收前不得发稳定版。

## 5. Web 回归与三端验收

- [x] 5.1 比较 0.3.0 与 Web 候选 tarball 的完整 exports/类型/CSS 映射，并在最小 Web fixture 逐入口消费；执行既有 `yarn check`、`yarn build`、`yarn test:e2e`，保留通过结果及快照差异说明，确认既有 ARIA/键盘和主题隔离不变。
- [x] 5.2 在独立 painting 消费 checkout 安装 Web 候选 tarball，保持业务源码和工具栏不变，运行既有类型/构建及 Icon/主题相关回归；提交消费版本、命令和结果记录，无法取得证据则保留未完成。
- [ ] 5.3 在 iOS 真机逐项执行 B01–H02，包含触控、中文软键盘、VoiceOver 和系统退出/回焦；填写设备/OS/SDK/RN/React/包精确版本、日期/执行者与证据，所有未执行或失败项保留未完成；Mac 操作仅交给后续设备操作员，本提案不执行。
- [ ] 5.4 在 Android 真机逐项执行同一 B01–H02，包含 TalkBack、系统返回与键盘窗口变化；按相同模板保存证据，不用 Expo DOM 或模拟器结果替代原生真机结论。
- [x] 5.5 在 Web 执行同一 B01–H02，记录 Playwright 对应覆盖与手工补验，并汇总三端每 ID 结果、平台步骤差异及依赖图证据；仅全部必要项通过才标记三端验收完成，否则禁止稳定推广。

## 6. 文档与实施交接

- [x] 6.1 更新 README、原生包文档和 Web/Expo 示例，包含版本区间、peers、入口、API 映射、自定义色差异、焦点目标和清单链接；从干净项目按文档完成 tarball 接入，验证原生无需 CSS/Web 包。
- [x] 6.2 汇总版本、标签、发布顺序与回退记录，明确是否需要 Web0.3.1 兼容补丁、原生独立版本以及剩余设备/权限阻塞；核对 OpenSpec strict、任务勾选和真实证据一致，列明 PencilKit/HAM-164 不在范围，交给发布/验收角色，不自动部署、合并或归档。

## 实施边界记录（2026-11-04）

2.2–3.4 原生代码已实现，但任务包含的宿主行为/读屏观察缺真机证据，保留未勾；与 5.3/5.4 一并交设备操作员，不以构建成功补勾。4.5 缺 npm 登录/scope 权限确认及发布 secret/环境，明确发布阻塞。完整实现、证据与交接见 `docs/implementation/add-expo-native-components.md`。未发布、未合并、未归档。
