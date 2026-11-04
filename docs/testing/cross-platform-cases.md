# 三端共享行为清单

统一数据：`fixtures/cross-platform.json`。Web 运行 Demo 的 `?validation=1` 页面；Expo 运行 `examples/native/`，仅使用安装后的原生 tarball。版本目标及接入见 `packages/components-native/README.md`。Web 的开合/回焦由 fixture 包装既有表面实现，原 Web Popover 本身不承诺这些功能。

本轮 iOS/Android 真机及操作员未落实，所有原生结果为 **待执行**。构建/静态审查不代表行为或无障碍验收通过。设备须各至少一台真机；模拟器、Expo DOM、HAM-164、PencilKit 的结果均不能替代。

| ID  | Web / iOS / Android 共同步骤与预期                                 | 原生补充步骤                                                         | 可见证据                         |
| --- | ------------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------- |
| B01 | 激活 B01 一次→count=1；切换禁用后再次激活仍为1                     | 触控及 VoiceOver/TalkBack 激活；禁用播报                             | count、disabled 与操作录屏       |
| B02 | 六 variant×三 size，ghost 与旧 ghost 均可见                        | 测量最小44dp、按压状态、系统大字号不截字                             | 37个按钮、触达尺寸和字号设置     |
| I01 | 遍历全部65个名称，几何与0.3.0一致；装饰不重复读出                  | 原生 SVG、size/color；读屏经过图标                                   | 图标画面、读屏记录、Metro路径    |
| T01 | 受控/非受控输入“中文输入测试”，失焦后保留，可见值一致              | 中文软键盘；focus/blur；键盘打开不丢已提交值                         | 两个值、变化回调、键盘录屏       |
| T02 | label可见；切换error后替代hint；禁用不可编辑                       | 读屏说明与错误公告                                                   | error/disabled状态与播报记录     |
| P01 | 打开菜单，焦点到首可用项；取消/遮罩/关闭回触发器；禁用项不可选     | 背景不可穿透；Android系统返回/iOS escape；读屏焦点与输入焦点分开记录 | open、焦点路径、单次关闭日志     |
| P02 | 进入子菜单，返回父项，再入子级选叶子→selected仅+1且整树关闭        | 触控逐层，expanded语义；Android Back先退子级                         | selected、返回路径、开合状态     |
| P03 | 在边缘打开，调整窗口，末行可滚动访问且边界内                       | 旋转、safe area、软键盘开/关、无锚点居中                             | 窗口尺寸、末行、面板边界及录屏   |
| P04 | 打开后移除触发器再关闭，有后备回后备、无后备安全结束；卸载整个弹层 | 验证无失效handle、迟到聚焦/关闭；宿主背景访问恢复                    | fallback开关、焦点路径和运行日志 |
| H01 | light/dark×五预设；内层dark/teal不影响外层/宿主                    | 从内层打开Modal继承，系统字号放大                                    | 主题状态、Modal画面与宿主对照    |
| H02 | 自定义accent、圆角、间距、字号仅影响该子树                         | #RRGGBB与显式状态色；Web任意CSS颜色仍支持                            | 兄弟对照、token数值、状态色      |

Web 自动化映射：`e2e/cross-platform.spec.ts` 覆盖以上11个ID的浏览器步骤；`src/test/shared-data.test.tsx` 将65个名称的每个图元和属性与从0.3.0源码提交ac783da保存的独立基线逐一比较；其他既有Playwright用例保留视觉、ARIA、键盘与菜单方向验证。桌面浏览器程序输入不声称验证了真实中文IME候选态或屏幕阅读器；原生平台步骤必须另录。Web新增fixture不修改消费库原有交互实现。

数值token映射：radius small/medium/large=6/8/12；spacing buttonGap/fieldGap/fieldPadding/panelPadding=8/7/11/12；fontSize small/medium/large=12/13/14；layer popover/menu=1000。Button视觉高度30/36/42映射原生最小44；padding=11/14/18。颜色为`MODE_COLORS`与`THEME_ACCENTS`，RN不解析CSS变量、color-mix或Web字体栈。原生Context局部覆盖，Web继续CSS级联；层级1000是语义token，不能穿越Modal窗口。

## 每端每ID记录模板

- ID / 平台 / 结果：待执行、通过或失败（不得省略平台步骤）。
- 设备型号 / OS精确版本 / SDK / RN / React / SVG / 候选包精确版本与tarball SHA256。
- 操作员 / 日期 / 输入方式（鼠标、键盘、触控、中文IME、VoiceOver、TalkBack、硬件键盘）。
- 步骤 / 预期 / 实际 / 回调前后计数 / 可见状态 / 失败与重现方法。
- 截图、录屏或操作日志的证据位置。读屏入焦/回焦必须有操作记录或录屏，单张截图不够。
- 若设备或权限缺失写确切阻塞和负责人；保留未执行，不预填通过。

三端结果与发布阻塞汇总在 `docs/implementation/add-expo-native-components.md`。全部必要步骤通过前禁止推广原生稳定版。
