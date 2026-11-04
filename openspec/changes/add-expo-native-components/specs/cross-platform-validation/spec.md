# Spec Delta

## Purpose

建立能够由不同平台操作员重复执行的基础组件行为验收契约，使用同一组用例标识对齐 iOS、Android 与 Web 的结果，区分浏览器自动化证据和原生设备证据，防止以构建成功或模拟器截图替代真实输入与无障碍验证。

## ADDED Requirements

### Requirement: 三端共享行为用例

发行候选 SHALL 具备同一份 B01/B02、I01、T01/T02、P01/P02/P03/P04、H01/H02 用例目录，覆盖按钮启用/禁用及样式、全部图标、中文受控/非受控输入与错误提示、弹层开合/选择/子级返回/回焦/触发器卸载/边缘避让及嵌套主题。每个 ID SHALL 在 iOS、Android、Web 分别产生结果，平台适配步骤 SHALL 明确；MUST 不将系统返回与读屏检查以平台差异为由整体跳过。

#### Scenario: 逐 ID 比较
- **WHEN** 验收者对三端候选运行共享用例
- **THEN** 每个 ID 均有三端结果，核心状态与回调次数一致，输入手段、读屏角色和特有系统动作按平台记录，而非要求 DOM props 与原生 props 相同

### Requirement: 原生验证证据真实可复核

首期 SHALL 采用原生手工清单和已有 Web 自动化，不宣传尚未建立的原生自动化。iOS 与 Android SHALL 各至少有一台真机完成触控、中文键盘和 VoiceOver/TalkBack 检查，Web SHALL 保留 Chromium 自动化并手工补齐其未覆盖项。每份记录 MUST 包含设备/OS、SDK/RN/React 与包精确版本、输入方式、步骤、预期/实际、结果、执行者/日期及证据。未执行、失败、设备缺失 SHALL 明确标注，MUST 不填写通过。

#### Scenario: 设备缺失
- **WHEN** 仅完成 Web 自动化或原生模拟器构建，缺少任一原生真机读屏/输入证据
- **THEN** 对应验收保持未完成，不宣布三端通过，不将候选推广为稳定版

#### Scenario: 焦点证据
- **WHEN** 记录弹层打开、系统退出和触发器消失的读屏焦点结果
- **THEN** 附带操作记录或录屏说明焦点移动路径，单张截图不被当作焦点正确的充分证据

### Requirement: Web 回归与消费方验证

共享数据抽取或发布配置调整后 SHALL 通过现有 Web 单元、交互、视觉、类型与构建检查，并验证 painting 现有 Web 消费方式。消费方验证 MUST 不改其工具栏产品行为，既有发布包安装验证 MUST 使用 tarball 而非仓库源码别名。依赖图与版本兼容证据 SHALL 随候选记录交付。

#### Scenario: 候选回归交付
- **WHEN** 验收者评估一个发行候选
- **THEN** 能查到 Web 检查结果、painting 升级不改代码的构建及 Icon 回归记录、原生 tarball 安装和全入口模块图；缺失项被列为未完成而不是用 Demo 成功替代

### Requirement: 文档与示例同步

组件库 SHALL 同步提供 Web/原生安装入口、版本区间、必要 peers、API 映射、主题支持格式、焦点目标约定、示例与行为清单。文档 MUST 明确原生包首期支持 iOS/Android，Web 使用既有包；PencilKit、painting 工具栏和 HAM-164 设备任务不属于本变更交付，亦不能替代本变更验收。

#### Scenario: 消费者照文档接入
- **WHEN** 新消费者依文档创建原生宿主并安装原生包
- **THEN** 无需导入 styles.css 或 Web 包即可运行所有首期组件，能够按映射替换 onClick/HTMLElement 等 Web 特有 API，并找到相应的三端用例及已知限制
