# Proposal

## Why

`@hamster-note/components@0.3.0` 的 HTML/SVG、CSS 与 ReactDOM portal 无法直接渲染为 RN 控件。为 Expo 消费方增加原生基础组件，同时保留现有 Web API、逐组件入口和主题隔离，避免各产品重复实现交互与无障碍。

## What Changes

- 在 **HamsterNote/components** 仓库规划并实现后续工作；painting 仅作为 Web 回归消费方。按本线程要求以 OpenSpec 1.13.1 初始化仓库内 `openspec/`，配置 `schema: spec-driven`、中文产物，使用本地根，不连接 store。当前无主规格或历史 change。
- 选择**拆分包**：保留根包 `@hamster-note/components`，新增独立发布的 `@hamster-note/components-native`；原生包不得依赖或重导出 Web 包，不引入 react-dom 的强制 peer 或传递依赖。纯数据在构建期共享，不为此再发布第三个包。
- 原生首期覆盖 Button、Icon、Popover/Menu（含子菜单）、TextField 与颜色/圆角/间距/字号/层级 token；采用 RN 原语、react-native-svg 与局部主题 Context，提供原生 API 映射和示例。
- 提案支持区间限定为 Expo SDK `>=54.0.36 <55`、RN `>=0.81.5 <0.82`、React `>=19.1.0 <19.2`，基线为 Expo `54.0.36` / RN `0.81.5` / React `19.1.0`；这是依据 SDK 54 模板选定的首期兼容目标，并非已确认的消费方版本或已完成验证。更高 SDK 不在首期承诺内。
- 原生 Button/Menu 使用 Pressable 的 role/state/label；弹层管理读屏焦点、关闭回焦和 Android 返回；TextField 使用 TextInput 的原生输入焦点。Web 既有 ARIA、键盘与弹层行为保持。
- 沿用 Web Vitest/Playwright；新增一份三端共用行为清单及 Expo 验收宿主，原生首期按清单手工验证并留设备证据，不承诺尚未配置的原生自动化。

## Capabilities

### New Capabilities

- `native-foundation`: 原生基础控件、嵌套主题、图标渲染、弹层及无障碍行为。
- `package-compatibility`: 独立发布、目标版本、原生依赖隔离与现有 Web 导出兼容。
- `cross-platform-validation`: 三端共享用例、原生手工证据、Web 回归和文档交接门槛。

### Modified Capabilities

无；仓库目前没有 OpenSpec 主规格。

## Impact

后续实现涉及根 `package.json` 的开发组织、`vite.lib.config.ts`、`src/components/` 的纯数据抽取、新增 `packages/components-native/`、`examples/native/`、发布 workflow、README 与测试文档。本次只交付规划与 OpenSpec 配置，不修改这些实现。

Web 包继续使用已有 `v<version>` 发布约定，原生采用独立 `native-v<version>`、从 `0.1.0-beta.0` 起步，验收后 `0.1.0`；Web 如有共享数据抽取则作为兼容补丁 `0.3.1` 发布，无变更则维持 `0.3.0`。新包发布权限、iOS/Android 设备和操作员是后续实施/验收依赖；本轮不发布。painting 工具栏、其他原生组件、PencilKit、输入桥接和 HAM-164 的 Mac/实机验收不在范围内；HAM-163 自身的 RN 三端验收仍必须执行。
