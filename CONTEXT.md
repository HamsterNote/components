# 领域词汇表

## Drawer 展示状态

- **自适应状态（adaptive state）**：Drawer 按调用方指定尺寸或组件默认尺寸展示的常规状态。
- **全屏状态（fullscreen state）**：Drawer 占满可用视口的展开状态。
- **全屏切换动作（fullscreen toggle action）**：在自适应状态与全屏状态之间切换的等价操作入口；进入全屏与退出全屏是两个方向相反、必须清晰区分的动作。

## 组件库边界

- **基础组件（foundation component）**：不包含产品业务规则、可跨业务场景复用的界面构件。
- **业务组件（business component）**：组合基础组件并封装明确业务概念与交互流程的界面构件。
- **Pro 组件库（Pro component library）**：独立发布、主要承载业务组件的组件库；与基础组件库独立演进版本。
