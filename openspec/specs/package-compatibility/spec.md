# package-compatibility Specification

## Purpose

定义 Web 与原生组件包可独立安装、构建和发布的兼容性契约，使原生使用方获得不含 DOM 运行时的可解析入口，同时使现有 Web 消费方保留已有导出、样式路径、类型和行为，无需为新增原生支持修改调用方式。

## Requirements

### Requirement: 独立原生发布包

系统 SHALL 独立发布 `@hamster-note/components-native`，提供根入口与 button、icon、popover、menu、text-field、theme 子路径及其类型声明。其安装依赖闭包和公共原生入口的运行解析图 MUST 不包含 Web 组件包、react-dom、DOM 渲染器或 CSS 运行依赖。仅改变代码入口条件 MUST 不被视为依赖隔离证据。

#### Scenario: 干净项目安装所有公共入口
- **WHEN** 在无 Web 包的干净消费项目安装原生发布 tarball 和声明的原生 peers，并解析其全部入口
- **THEN** 安装不要求 react-dom，各入口 JS/类型均可解析，iOS/Android 的可达库模块中没有 DOM/CSS 运行依赖，且结果可由安装树与实际打包模块清单复核

### Requirement: 保持 Web 全量导出与行为

Web 包 SHALL 保留 0.3.0 根入口及 `./button`、`./icon`、`./badge`、`./confirm`、`./dialog`、`./drawer`、`./kbd`、`./loading`、`./menu`、`./note-card`、`./popover`、`./text-field`、`./theme` 和 `./styles.css`，其既有调用及类型 MUST 继续可用，CSS 映射路径 MUST 保留为 `./dist/hamster-note-components.css`。新增原生能力 MUST 不引入新的宿主全局主题覆盖，不移除或削弱 Web 已有 ARIA、键盘与焦点行为。

#### Scenario: Web 消费方无代码迁移升级
- **WHEN** 既有 Web 使用方保持 import、styles.css 引入和 props 不变，安装候选兼容版本
- **THEN** 原有代码类型检查与构建通过，Button/Icon/Popover/Menu/TextField 交互和主题隔离不退化，原有子菜单键盘进入及退出回焦仍有效

#### Scenario: 全量导出与 CSS 消费
- **WHEN** 消费项目逐一导入根及全部既有子路径并加载 styles.css
- **THEN** 所有导出和类型解析成功，CSS 路径及既有默认视觉不变，无因原生拆包造成的删除或重定向

### Requirement: 明确版本支持窗口

首期原生发行 SHALL 将支持窗口声明为 Expo `>=57.0.31 <58.0.0`、RN `>=0.86.3 <0.87.0`、React `>=19.2.3 <19.3.0`，并记录验收的实际锁定组合。原生 manifest SHALL 仅约束库所需 RN/React/SVG peers，不强制依赖 Expo 运行时。窗口以外版本 MUST 不宣传为已支持；Web peers SHALL 保留 React/ReactDOM `^19.0.0`。

#### Scenario: 基线与窗口外版本
- **WHEN** 消费者查阅兼容表和原生 manifest
- **THEN** 能找到 SDK57/RN0.86.3/React19.2.3 验收基线、实际 patch 与必要 SVG peer，且更高 SDK 不被标记为已验证，Web peer 契约不变

### Requirement: 独立版本与标签路由

Web 包 SHALL 继续以根 package.json 和 `v<version>` 标签发布；原生包 SHALL 使用独立版本、manifest 及 `native-v<version>` 标签，从 `0.1.0-beta.0` 起步。每个发布任务 MUST 校验对应版本并只发布目标包；原生预发布 MUST 不推进 latest，稳定版推广 MUST 以三端验收通过为前提。已发布版本 MUST 不覆盖。

#### Scenario: 标签匹配与预发布隔离
- **WHEN** 分别处理 Web v 标签和原生 native-v beta 标签
- **THEN** 仅各自目标包被构建并发布，原生 beta 进入 beta dist-tag，Web 版本及 latest 不被误改，版本不匹配时拒绝发布
