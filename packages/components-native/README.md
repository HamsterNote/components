# @hamster-note/components-native

Expo SDK54 的 iOS/Android 原生基础组件。当前是 `0.1.0-beta.0` 候选；真机读屏与中文键盘验收待执行，尚未发布。Web 原有调用方继续使用 `@hamster-note/components`；Expo web 验收可使用本包的 browser 条件构建，宿主安装 SDK54 对应的 react-native-web/react-dom/@expo/metro-runtime。

兼容目标：Expo `>=54.0.36 <55`，RN `>=0.81.5 <0.82`，React `>=19.1.0 <19.2`，SVG `15.12.1`。已构建基线为 Expo54.0.36/RN0.81.5/React19.1.0；区间内其他 patch 组合仍需重新验证。Expo 不属于本库 peer。

在仓库根构建候选：

```sh
yarn --cwd packages/components-native install --frozen-lockfile
yarn --cwd packages/components-native build
mkdir -p artifacts/native
npm pack ./packages/components-native --pack-destination ./artifacts/native
```

已有 SDK54 项目使用 tarball：

```sh
npx expo install react-native-svg
npm install /path/to/hamster-note-components-native-0.1.0-beta.0.tgz
```

全新项目先选择 SDK54 模板，并把 Expo/RN/React 锁到上述基线。无需 CSS 或 Web 包。仓库验收宿主通过 `npm install ../../artifacts/native/hamster-note-components-native-0.1.0-beta.0.tgz` 安装，`npm start` 启动；测试数据在 `fixtures/cross-platform.json`，不是库源码别名。

```tsx
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, Menu, MenuItem, ThemeProvider } from '@hamster-note/components-native';

function Example() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<View>(null);
  const insets = useSafeAreaInsets(); // 宿主置于 SafeAreaProvider 内
  return (
    <ThemeProvider mode="light" accent="blue">
      <View
        accessibilityElementsHidden={open}
        importantForAccessibility={open ? 'no-hide-descendants' : 'auto'}
      >
        <Button ref={trigger} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)}>
          <Icon name="menu" />
          菜单
        </Button>
      </View>
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        accessibilityLabel="操作菜单"
        anchorRef={trigger}
        triggerRef={trigger}
        safeAreaInsets={insets}
      >
        <MenuItem onPress={() => console.log('selected')}>保存</MenuItem>
      </Menu>
    </ThemeProvider>
  );
}
```

入口为根、`/button`、`/icon`、`/popover`、`/menu`、`/text-field`、`/theme`，均包含 JS/类型。纯图标与主题/尺寸数据在构建时内联。

| Web                   | Native                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------- |
| onClick / HTML attrs  | onPress / PressableProps；variant、size、ghost/旧 ghost 别名保留；最小 44dp                 |
| SVG CSS 大小/颜色     | Icon size、color；65 个名称相同；无 label 的图标不单独播报                                  |
| input onChange(event) | TextField onChangeText(string)，value/defaultValue，ref focus/blur，disabled→editable=false |
| HTMLElement anchor    | Popover anchorRef，用 measureInWindow；受控 open/onClose；无锚点居中                        |
| CSS 主题/任意 CSS 色  | Context 主题；dark/light × 五预设；自定义仅 #RRGGBB 或 AccentColors 三色对象                |
| CSS 自定义属性        | tokens.radius/spacing/fontSize/layer 局部数值覆盖，单位 dp/sp                               |

Menu 组合支持 MenuItem、MenuLabel、MenuSeparator、MenuSubmenu（可放 Fragment）；不接受任意包装组件作为菜单结构节点。子层在同一 Modal 中替换，返回先退一级，叶子回调仅一次后关闭整树。Popover 通用内容不会自动关闭。设置 `placement="top|bottom|left|right"`、anchorOffset、viewportMargin 调整避让；超高内容由内部 ScrollView 滚动。

焦点目标请传真实 RN host ref（View/Pressable/TextInput），不要缓存 node handle。`triggerRef` 已卸载时使用 `fallbackFocusRef`，无目标安全结束。Modal onShow 和布局均完成后移动读屏焦点；TextInput 的 focus/blur 与 AccessibilityInfo 的读屏焦点是两条路径，硬件方向键菜单导航不在首期保证内。命名标题为空菜单的入焦目标。取消、遮罩、可见关闭、Android 返回/iOS escape 共用关闭守卫。

为完整背景隔离，宿主用同一受控 open 状态，在仅包裹背景的 View 声明 accessibilityElementsHidden 与 importantForAccessibility（如上例）；多个弹层时对全部 open 状态取或。Modal 必须是其兄弟。未发布候选已移除 backgroundRef 命令式控制，避免与宿主状态冲突或依赖 RN Web 已移除的 setNativeProps。原生 Modal 还声明 accessibilityViewIsModal。安全区必须由宿主通过 safeAreaInsets 提供（推荐 safe-area-context）；库的默认值只是 Android 状态栏与 margin，无法推断所有 iOS 刘海/底栏。该宿主责任已在示例落实。主题通过 Context 显式传入 Modal，不写宿主全局样式。

颜色映射忠实于 Web 预设；字体用系统回退并允许系统缩放。半透明色使用 RN 支持的 rgba 格式。全部 token 分类和原生设备记录见仓库 `docs/testing/cross-platform-cases.md`。公开发布使用 `native-v0.1.0-beta.0`→beta；稳定推广需三端验收及发布角色批准。不要用构建成功冒充 VoiceOver/TalkBack 或真机输入已通过。

原生构建的 SVG 只导入七个原生图元；browser 条件构建改用 react-native-svg 公共入口，避免把 Fabric 原生模块发给浏览器。两者均不新增库运行依赖，react-native-web/react-dom 仅由 Expo web 宿主安装。浏览器回焦使用组件 ref 的 focus 方法；系统读屏与软键盘仍需各端验收。
