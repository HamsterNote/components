import { useRef, useState } from 'react';
import { ScrollView, Text, View, type TextInput } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
// Every public subpath is consumed from the installed tarball, never a source alias.
import { ThemeProvider, useTheme } from '@hamster-note/components-native';
import {
  Button,
  type ButtonVariant,
  type ButtonSize,
} from '@hamster-note/components-native/button';
import { Icon, ICON_NAMES } from '@hamster-note/components-native/icon';
import { Popover } from '@hamster-note/components-native/popover';
import {
  Menu,
  MenuItem,
  MenuSubmenu,
  MenuLabel,
  MenuSeparator,
} from '@hamster-note/components-native/menu';
import { TextField } from '@hamster-note/components-native/text-field';
import { THEME_ACCENTS, type ThemeAccentPreset } from '@hamster-note/components-native/theme';
import data from '../../fixtures/cross-platform.json';
function Surface() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [count, setCount] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState(data.initialText);
  const [rawValue, setRawValue] = useState(data.initialText);
  const [error, setError] = useState(false);
  const [panel, setPanel] = useState<'menu' | 'popover' | 'inner' | null>(null);
  const [selected, setSelected] = useState(0);
  const [triggerVisible, setTriggerVisible] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [fallback, setFallback] = useState(true);
  const trigger = useRef<View>(null);
  const background = useRef<View>(null);
  const fallbackRef = useRef<View>(null);
  const input = useRef<TextInput>(null);
  const overlayProps = {
    onClose: () => setPanel(null),
    anchorRef: trigger,
    triggerRef: trigger,
    fallbackFocusRef: fallback ? fallbackRef : undefined,
    backgroundRef: background,
    safeAreaInsets: insets,
    accessibilityLabel: 'P01–P04 操作菜单',
  };
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: t.colors.surface }}>
      <View ref={background} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 20 }}
        >
          <Text style={{ color: t.colors.text }}>
            B01 count={count}; disabled={String(disabled)}; P02 selected={selected}; open=
            {panel ?? 'closed'}
          </Text>
          <Button disabled={disabled} onPress={() => setCount(count + 1)}>
            B01 激活
          </Button>
          <Button onPress={() => setDisabled(!disabled)}>切换禁用</Button>
          {data.variants.map((v) =>
            data.sizes.map((s) => (
              <View key={`${v}-${s}`} style={{ flexDirection: 'row', gap: 8 }}>
                <Button variant={v as ButtonVariant} size={s as ButtonSize}>
                  {v}/{s}
                </Button>
                <Button variant={v as ButtonVariant} size={s as ButtonSize} ghost>
                  ghost
                </Button>
              </View>
            )),
          )}
          <Button variant="ghost">B02 旧 ghost 别名</Button>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {ICON_NAMES.map((name) => (
              <View key={name}>
                <Icon name={name} label={name} size={28} color={t.colors.accent} />
                <Text style={{ color: t.colors.text }}>{name}</Text>
              </View>
            ))}
          </View>
          <Icon name="pen" />
          <Text style={{ color: t.colors.text }}>I01 上方为装饰图标</Text>
          <TextField
            ref={input}
            label={data.label}
            value={value}
            onChangeText={setValue}
            hint={data.hint}
            error={error ? data.error : undefined}
            disabled={disabled}
          />
          <TextField
            label="非受控笔记"
            defaultValue={data.initialText}
            onChangeText={setRawValue}
          />
          <Text style={{ color: t.colors.text }}>
            T01 controlled={value}; uncontrolled={rawValue}
          </Text>
          <Button onPress={() => input.current?.focus()}>focus</Button>
          <Button onPress={() => input.current?.blur()}>blur</Button>
          <Button onPress={() => setError(!error)}>T02 切换错误</Button>
          {triggerVisible ? (
            <Button
              ref={trigger}
              accessibilityState={{ expanded: panel !== null }}
              onPress={() => {
                setMounted(true);
                setPanel('menu');
              }}
            >
              P01 打开菜单
            </Button>
          ) : null}
          <Button
            onPress={() => {
              setMounted(true);
              setPanel('popover');
            }}
          >
            P03 超高弹层
          </Button>
          <Button
            ref={fallbackRef}
            onPress={() => {
              setTriggerVisible(true);
              setMounted(true);
              setPanel(null);
            }}
          >
            P04 重置 / 后备目标
          </Button>
          <Button onPress={() => setFallback(!fallback)}>后备 {String(fallback)}</Button>
          <ThemeProvider mode="dark" accent="teal">
            <Button onPress={() => setPanel('inner')}>H01 内层 dark/teal 打开弹层</Button>
          </ThemeProvider>
          <ThemeProvider
            accent="#ff8800"
            tokens={{
              radius: { medium: 18 },
              spacing: { buttonGap: 16 },
              fontSize: { medium: 22 },
            }}
          >
            <Button>H02 局部自定义</Button>
          </ThemeProvider>
        </ScrollView>
      </View>
      <ThemeProvider mode="dark" accent="teal">
        <Popover {...overlayProps} open={panel === 'inner'}>
          <Button>H01 内层 Modal</Button>
        </Popover>
      </ThemeProvider>
      {mounted ? (
        <Menu {...overlayProps} open={panel === 'menu'}>
          <MenuLabel>菜单标签</MenuLabel>
          <MenuItem onPress={() => setSelected(selected + 1)}>叶子选择</MenuItem>
          <MenuItem disabled onPress={() => setSelected(-999)}>
            禁用项
          </MenuItem>
          <MenuSeparator />
          <MenuSubmenu label="子菜单">
            <MenuSubmenu label="孙菜单">
              <MenuItem onPress={() => setSelected(selected + 1)}>深层叶子</MenuItem>
            </MenuSubmenu>
            <MenuItem onPress={() => setSelected(selected + 1)}>子级叶子</MenuItem>
          </MenuSubmenu>
          <MenuItem
            onPress={() => {
              setTriggerVisible(false);
              setPanel('popover');
            }}
          >
            移除触发器
          </MenuItem>
        </Menu>
      ) : null}
      {mounted ? (
        <Popover {...overlayProps} open={panel === 'popover'}>
          <Button onPress={() => setTriggerVisible(false)}>P04 移除触发器</Button>
          <Button
            onPress={() => {
              setMounted(false);
              setPanel(null);
            }}
          >
            卸载整个弹层
          </Button>
          <TextField label="P03 键盘" />
          {Array.from({ length: 40 }, (_, i) => (
            <Text key={i} style={{ color: t.colors.text }}>
              可滚动内容 {i + 1}
            </Text>
          ))}
        </Popover>
      ) : null}
    </View>
  );
}
function Validation() {
  const [mode, setMode] = useState<'dark' | 'light'>('dark');
  const [accent, setAccent] = useState<ThemeAccentPreset>('violet');
  return (
    <ThemeProvider mode={mode} accent={accent}>
      <View style={{ flex: 1 }}>
        <View style={{ padding: 12, flexDirection: 'row', flexWrap: 'wrap' }}>
          <Button onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}>H01 {mode}</Button>
          {Object.keys(THEME_ACCENTS).map((a) => (
            <Button key={a} onPress={() => setAccent(a as ThemeAccentPreset)}>
              {a}
            </Button>
          ))}
        </View>
        <Surface />
      </View>
    </ThemeProvider>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <Validation />
    </SafeAreaProvider>
  );
}
