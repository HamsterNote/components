import { useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type TextInput,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
// Every public subpath is consumed from the installed tarball, never a source alias.
import { ThemeProvider, useTheme } from '@hamster-note/components-native';
import {
  Button,
  type ButtonVariant,
  type ButtonSize,
} from '@hamster-note/components-native/button';
import { Icon, ICON_NAMES, type IconName } from '@hamster-note/components-native/icon';
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

type Category = 'button' | 'icon' | 'form' | 'overlay' | 'theme';
type Panel = 'menu' | 'popover' | 'inner' | null;

const CATEGORIES: { id: Category; label: string; detail: string }[] = [
  { id: 'button', label: '基础', detail: 'Button' },
  { id: 'icon', label: '图标', detail: 'Icon' },
  { id: 'form', label: '表单', detail: 'TextField' },
  { id: 'overlay', label: '浮层', detail: 'Popover / Menu' },
  { id: 'theme', label: '主题', detail: '色板与 token' },
];

function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      <Text style={styles.sectionDescription}>{description}</Text>
      {children}
    </View>
  );
}

function ExampleCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.cardTitle}>
        {title}
      </Text>
      <Text style={styles.cardDescription}>{description}</Text>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function CategoryNavigation({
  active,
  compact,
  onChange,
}: {
  active: Category;
  compact: boolean;
  onChange: (category: Category) => void;
}) {
  const items = CATEGORIES.map((category) => (
    <Pressable
      key={category.id}
      accessibilityRole="button"
      accessibilityState={{ selected: active === category.id }}
      accessibilityLabel={`${category.label} ${category.detail}`}
      onPress={() => onChange(category.id)}
      style={({
        pressed,
        hovered,
        focused,
      }: {
        pressed: boolean;
        hovered?: boolean;
        focused?: boolean;
      }) => [
        styles.navItem,
        compact ? styles.navItemCompact : null,
        active === category.id ? styles.navItemActive : null,
        hovered && active !== category.id ? styles.navItemHovered : null,
        pressed ? styles.navItemPressed : null,
        focused ? styles.focusRing : null,
      ]}
    >
      <Text style={[styles.navLabel, active === category.id ? styles.navLabelActive : null]}>
        {category.label}
      </Text>
      <Text style={[styles.navDetail, active === category.id ? styles.navDetailActive : null]}>
        {category.detail}
      </Text>
    </Pressable>
  ));

  if (compact) {
    return (
      <ScrollView
        horizontal
        accessibilityRole="tablist"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.compactNav}
      >
        {items}
      </ScrollView>
    );
  }
  return (
    <View accessibilityRole="tablist" style={styles.sidebarNav}>
      {items}
    </View>
  );
}

function ButtonExamples({
  count,
  disabled,
  onActivate,
  onToggleDisabled,
}: {
  count: number;
  disabled: boolean;
  onActivate: () => void;
  onToggleDisabled: () => void;
}) {
  return (
    <Section
      eyebrow="BASIC / BUTTON"
      title="Button 按钮"
      description="用于触发操作。提供六种语义变体、三档尺寸，以及透明背景样式。"
    >
      <ExampleCard
        title="交互与禁用"
        description="点击主按钮计数；开关会同步影响表单中的受控输入框。"
      >
        <View style={styles.row}>
          <Button variant="primary" disabled={disabled} onPress={onActivate}>
            B01 激活
          </Button>
          <Button onPress={onToggleDisabled}>{disabled ? '解除禁用' : '切换禁用'}</Button>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>count={count}</Text>
            <Text style={styles.statusDivider}>·</Text>
            <Text style={styles.statusText}>disabled={String(disabled)}</Text>
          </View>
        </View>
      </ExampleCard>
      <ExampleCard
        title="变体与尺寸"
        description="同一套主题 token 驱动所有语义；每行对应一种尺寸。"
      >
        {data.sizes.map((size) => (
          <View key={size} style={styles.matrixRow}>
            <Text style={styles.matrixLabel}>{size}</Text>
            <View style={styles.row}>
              {data.variants.map((variant) => (
                <Button key={variant} variant={variant as ButtonVariant} size={size as ButtonSize}>
                  {variant}
                </Button>
              ))}
            </View>
          </View>
        ))}
      </ExampleCard>
      <ExampleCard
        title="透明样式"
        description="ghost 属性适用于所有变体；旧 ghost 变体继续作为别名保留。"
      >
        <View style={styles.row}>
          <Button variant="primary" ghost>
            Primary ghost
          </Button>
          <Button variant="danger" ghost>
            Danger ghost
          </Button>
          <Button variant="ghost">B02 旧 ghost 别名</Button>
        </View>
      </ExampleCard>
    </Section>
  );
}

function IconExamples() {
  return (
    <Section
      eyebrow="FOUNDATION / ICON"
      title="Icon 图标"
      description={`共 ${ICON_NAMES.length} 枚线性图标，基于 SVG，可配置尺寸、颜色与无障碍标签。`}
    >
      <ExampleCard
        title="默认与可访问名称"
        description="无 label 的图标为装饰内容；有 label 时作为图像提供给辅助技术。"
      >
        <View style={styles.iconFeature}>
          <View style={styles.iconFeatureGlyph}>
            <Icon name="pen" size={32} />
          </View>
          <View style={styles.iconFeatureCopy}>
            <Text style={styles.iconFeatureTitle}>pen · 24px</Text>
            <Text style={styles.cardDescription}>I01 上方为装饰图标</Text>
          </View>
        </View>
      </ExampleCard>
      <ExampleCard title="完整图标集" description="统一 24 × 24 视图框；示例以 22px 展示。">
        <View style={styles.iconGrid}>
          {ICON_NAMES.map((name: IconName) => (
            <View key={name} style={styles.iconItem}>
              <Icon name={name} label={name} size={22} color="#52525b" />
              <Text style={styles.iconName}>{name}</Text>
            </View>
          ))}
        </View>
      </ExampleCard>
    </Section>
  );
}

function FormExamples({
  input,
  value,
  rawValue,
  error,
  disabled,
  onValueChange,
  onRawValueChange,
  onToggleError,
}: {
  input: React.RefObject<TextInput | null>;
  value: string;
  rawValue: string;
  error: boolean;
  disabled: boolean;
  onValueChange: (value: string) => void;
  onRawValueChange: (value: string) => void;
  onToggleError: () => void;
}) {
  return (
    <Section
      eyebrow="FORM / TEXT FIELD"
      title="TextField 输入框"
      description="包含标签、辅助说明、错误反馈和禁用状态，支持受控与非受控用法。"
    >
      <ExampleCard title="受控输入" description="输入中文或任意文本，下方状态会实时同步。">
        <TextField
          ref={input}
          label={data.label}
          value={value}
          onChangeText={onValueChange}
          hint={data.hint}
          error={error ? data.error : undefined}
          disabled={disabled}
        />
        <Text style={styles.liveValue}>T01 controlled={value}</Text>
        <View style={styles.row}>
          <Button size="small" onPress={() => input.current?.focus()}>
            聚焦输入框
          </Button>
          <Button size="small" onPress={() => input.current?.blur()}>
            取消聚焦
          </Button>
          <Button size="small" variant={error ? 'danger' : 'secondary'} onPress={onToggleError}>
            T02 {error ? '清除错误' : '切换错误'}
          </Button>
        </View>
      </ExampleCard>
      <ExampleCard
        title="非受控输入"
        description="通过 defaultValue 设置初始值，组件内部维护输入状态。"
      >
        <TextField
          label="非受控笔记"
          defaultValue={data.initialText}
          onChangeText={onRawValueChange}
          hint="不通过 value 属性控制内容"
        />
        <Text style={styles.liveValue}>T01 uncontrolled={rawValue}</Text>
      </ExampleCard>
      <ExampleCard
        title="禁用状态"
        description="固定展示不可编辑的输入框；交互区的禁用开关作用于受控示例。"
      >
        <TextField label="只读笔记" value="当前状态不可编辑" disabled />
      </ExampleCard>
    </Section>
  );
}

function OverlayExamples({
  panel,
  selected,
  triggerVisible,
  fallback,
  trigger,
  popoverTrigger,
  fallbackRef,
  onOpen,
  onReset,
  onToggleFallback,
}: {
  panel: Panel;
  selected: number;
  triggerVisible: boolean;
  fallback: boolean;
  trigger: React.RefObject<View | null>;
  popoverTrigger: React.RefObject<View | null>;
  fallbackRef: React.RefObject<View | null>;
  onOpen: (panel: Exclude<Panel, null>) => void;
  onReset: () => void;
  onToggleFallback: () => void;
}) {
  return (
    <Section
      eyebrow="OVERLAY / POPOVER & MENU"
      title="Popover 与 Menu"
      description="锚定触发器展示上下文内容，支持键盘操作、焦点管理和安全区适配。"
    >
      <ExampleCard
        title="层级菜单"
        description="打开后展开「子菜单」，选择「子级叶子」；禁用项不会响应操作。"
      >
        <View style={styles.row}>
          {triggerVisible ? (
            <Button
              ref={trigger}
              variant="primary"
              accessibilityState={{ expanded: panel !== null }}
              onPress={() => onOpen('menu')}
            >
              P01 打开菜单
            </Button>
          ) : null}
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>P02 selected={selected}</Text>
            <Text style={styles.statusDivider}>·</Text>
            <Text style={styles.statusText}>open={panel ?? 'closed'}</Text>
          </View>
        </View>
      </ExampleCard>
      <ExampleCard
        title="长内容弹层"
        description="弹层包含输入框与 40 条可滚动内容；关闭后焦点返回触发器。"
      >
        <Button ref={popoverTrigger} onPress={() => onOpen('popover')}>
          P03 超高弹层
        </Button>
      </ExampleCard>
      <ExampleCard
        title="嵌套主题"
        description="内层 dark / teal 主题会穿透 Modal 边界，不受外层主题影响。"
      >
        <ThemeProvider mode="dark" accent="teal">
          <Button onPress={() => onOpen('inner')}>H01 内层 dark/teal 打开弹层</Button>
        </ThemeProvider>
      </ExampleCard>
      <ExampleCard
        title="焦点恢复"
        description="测试触发器移除、弹层卸载与后备焦点目标；重置可恢复初始状态。"
      >
        <View style={styles.row}>
          <Button ref={fallbackRef} onPress={onReset}>
            P04 重置 / 后备目标
          </Button>
          <Button onPress={onToggleFallback}>后备 {String(fallback)}</Button>
        </View>
      </ExampleCard>
    </Section>
  );
}

function ThemeExamples({
  mode,
  accent,
  onModeChange,
  onAccentChange,
}: {
  mode: 'dark' | 'light';
  accent: ThemeAccentPreset;
  onModeChange: () => void;
  onAccentChange: (accent: ThemeAccentPreset) => void;
}) {
  const t = useTheme();
  const colorTokens = [
    ['surface', t.colors.surface],
    ['text', t.colors.text],
    ['textMuted', t.colors.textMuted],
    ['borderStrong', t.colors.borderStrong],
    ['accent', t.colors.accent],
    ['danger', t.colors.danger],
    ['success', t.colors.success],
    ['warning', t.colors.warning],
  ];
  const numericTokens = [
    ['radius', 'small 6 / medium 8 / large 12'],
    ['spacing', 'buttonGap 8 / fieldGap 7 / panelPadding 12'],
    ['fontSize', 'small 12 / medium 13 / large 14'],
    ['layer', 'popover 1000 / menu 1000'],
  ];

  return (
    <Section
      eyebrow="FOUNDATION / THEME"
      title="主题与设计 Token"
      description="颜色、圆角、间距、字号与层级统一由 ThemeProvider 下发，也支持局部覆盖。"
    >
      <ExampleCard
        title="模式与强调色"
        description="切换会作用于整个示例站；选择预设色可实时预览组件状态。"
      >
        <View style={styles.row}>
          <Button variant="primary" onPress={onModeChange}>
            H01 {mode}
          </Button>
          {(Object.keys(THEME_ACCENTS) as ThemeAccentPreset[]).map((name) => (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityLabel={`主题色 ${name}`}
              accessibilityState={{ selected: accent === name }}
              onPress={() => onAccentChange(name)}
              style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
                styles.accentOption,
                accent === name ? styles.accentOptionSelected : null,
                pressed ? styles.navItemPressed : null,
                focused ? styles.focusRing : null,
              ]}
            >
              <View style={[styles.accentDot, { backgroundColor: THEME_ACCENTS[name].accent }]} />
              <Text style={styles.accentName}>{name}</Text>
            </Pressable>
          ))}
        </View>
      </ExampleCard>
      <ExampleCard title="当前色板" description="以下色值来自当前上下文，而非示例内的独立副本。">
        <View style={styles.tokenGrid}>
          {colorTokens.map(([name, color]) => (
            <View key={name} style={styles.colorToken}>
              <View style={[styles.colorSwatch, { backgroundColor: color }]} />
              <Text style={styles.tokenName}>{name}</Text>
              <Text style={styles.tokenValue}>{color}</Text>
            </View>
          ))}
        </View>
      </ExampleCard>
      <ExampleCard
        title="数值 Token"
        description="组件共享的基准值；单位均为 React Native 逻辑像素。"
      >
        {numericTokens.map(([name, value]) => (
          <View key={name} style={styles.numericToken}>
            <Text style={styles.tokenName}>{name}</Text>
            <Text style={styles.tokenValue}>{value}</Text>
          </View>
        ))}
      </ExampleCard>
      <ExampleCard title="局部覆盖" description="仅当前子树使用橙色、18px 圆角与 22px 字号。">
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
      </ExampleCard>
    </Section>
  );
}

function Showcase({
  category,
  mode,
  accent,
  onModeChange,
  onAccentChange,
  count,
  disabled,
  onActivate,
  onToggleDisabled,
  input,
  value,
  rawValue,
  error,
  onValueChange,
  onRawValueChange,
  onToggleError,
  panel,
  selected,
  triggerVisible,
  fallback,
  trigger,
  popoverTrigger,
  fallbackRef,
  onOpen,
  onReset,
  onToggleFallback,
}: {
  category: Category;
  mode: 'dark' | 'light';
  accent: ThemeAccentPreset;
  onModeChange: () => void;
  onAccentChange: (accent: ThemeAccentPreset) => void;
  count: number;
  disabled: boolean;
  onActivate: () => void;
  onToggleDisabled: () => void;
  input: React.RefObject<TextInput | null>;
  value: string;
  rawValue: string;
  error: boolean;
  onValueChange: (value: string) => void;
  onRawValueChange: (value: string) => void;
  onToggleError: () => void;
  panel: Panel;
  selected: number;
  triggerVisible: boolean;
  fallback: boolean;
  trigger: React.RefObject<View | null>;
  popoverTrigger: React.RefObject<View | null>;
  fallbackRef: React.RefObject<View | null>;
  onOpen: (panel: Exclude<Panel, null>) => void;
  onReset: () => void;
  onToggleFallback: () => void;
}) {
  switch (category) {
    case 'button':
      return (
        <ButtonExamples
          count={count}
          disabled={disabled}
          onActivate={onActivate}
          onToggleDisabled={onToggleDisabled}
        />
      );
    case 'icon':
      return <IconExamples />;
    case 'form':
      return (
        <FormExamples
          input={input}
          value={value}
          rawValue={rawValue}
          error={error}
          disabled={disabled}
          onValueChange={onValueChange}
          onRawValueChange={onRawValueChange}
          onToggleError={onToggleError}
        />
      );
    case 'overlay':
      return (
        <OverlayExamples
          panel={panel}
          selected={selected}
          triggerVisible={triggerVisible}
          fallback={fallback}
          trigger={trigger}
          popoverTrigger={popoverTrigger}
          fallbackRef={fallbackRef}
          onOpen={onOpen}
          onReset={onReset}
          onToggleFallback={onToggleFallback}
        />
      );
    case 'theme':
      return (
        <ThemeExamples
          mode={mode}
          accent={accent}
          onModeChange={onModeChange}
          onAccentChange={onAccentChange}
        />
      );
  }
}

function Gallery() {
  const [mode, setMode] = useState<'dark' | 'light'>('light');
  const [accent, setAccent] = useState<ThemeAccentPreset>('violet');
  return (
    <ThemeProvider mode={mode} accent={accent}>
      <Surface
        mode={mode}
        accent={accent}
        onModeChange={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        onAccentChange={setAccent}
      />
    </ThemeProvider>
  );
}

function Surface({
  mode,
  accent,
  onModeChange,
  onAccentChange,
}: {
  mode: 'dark' | 'light';
  accent: ThemeAccentPreset;
  onModeChange: () => void;
  onAccentChange: (accent: ThemeAccentPreset) => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 800;
  const [category, setCategory] = useState<Category>('button');
  const [count, setCount] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState(data.initialText);
  const [rawValue, setRawValue] = useState(data.initialText);
  const [error, setError] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState(0);
  const [triggerVisible, setTriggerVisible] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [fallback, setFallback] = useState(true);
  const trigger = useRef<View>(null);
  const popoverTrigger = useRef<View>(null);
  const fallbackRef = useRef<View>(null);
  const input = useRef<TextInput>(null);
  const overlayProps = {
    onClose: () => setPanel(null),
    anchorRef: trigger,
    triggerRef: trigger,
    fallbackFocusRef: fallback ? fallbackRef : undefined,
    safeAreaInsets: insets,
    accessibilityLabel: 'P01–P04 操作菜单',
  };
  const openPanel = (next: Exclude<Panel, null>) => {
    setMounted(true);
    setPanel(next);
  };

  return (
    <View style={[styles.app, { paddingTop: insets.top }]}>
      <View
        accessibilityElementsHidden={panel !== null}
        importantForAccessibility={panel !== null ? 'no-hide-descendants' : 'auto'}
        style={styles.app}
      >
        <View style={[styles.topbar, compact ? styles.topbarCompact : null]}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>HN</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>Hamster Components</Text>
              <Text style={styles.brandSubtitle}>Native UI kit</Text>
            </View>
          </View>
          <View style={styles.topbarMeta}>
            <View style={styles.platformPill}>
              <View style={styles.platformDot} />
              <Text style={styles.platformText}>React Native · Expo</Text>
            </View>
          </View>
        </View>

        {compact ? (
          <View style={styles.compactNavWrap}>
            <CategoryNavigation active={category} compact onChange={setCategory} />
          </View>
        ) : null}

        <ScrollView
          key={category}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 48 },
            compact ? styles.scrollContentCompact : null,
          ]}
        >
          <View style={[styles.layout, compact ? styles.layoutCompact : null]}>
            {!compact ? (
              <View style={styles.sidebar}>
                <Text style={styles.sidebarLabel}>组件</Text>
                <CategoryNavigation active={category} compact={false} onChange={setCategory} />
                <View style={styles.sidebarFooter}>
                  <Text style={styles.sidebarFooterTitle}>跨端组件，统一体验</Text>
                  <Text style={styles.sidebarFooterText}>
                    iOS、Android 与 Web 共享组件 API 和主题 token。
                  </Text>
                </View>
              </View>
            ) : null}
            <View style={styles.content}>
              <View style={styles.hero}>
                <Text style={styles.heroKicker}>COMPONENT EXPLORER</Text>
                <Text accessibilityRole="header" style={styles.heroTitle}>
                  为每一端而设计。
                </Text>
                <Text style={styles.heroDescription}>
                  浏览原生组件、交互状态与设计 token。所有示例均可直接操作。
                </Text>
              </View>
              <Showcase
                category={category}
                mode={mode}
                accent={accent}
                count={count}
                disabled={disabled}
                onActivate={() => setCount(count + 1)}
                onToggleDisabled={() => setDisabled(!disabled)}
                onModeChange={onModeChange}
                onAccentChange={onAccentChange}
                input={input}
                value={value}
                rawValue={rawValue}
                error={error}
                onValueChange={setValue}
                onRawValueChange={setRawValue}
                onToggleError={() => setError(!error)}
                panel={panel}
                selected={selected}
                triggerVisible={triggerVisible}
                fallback={fallback}
                trigger={trigger}
                popoverTrigger={popoverTrigger}
                fallbackRef={fallbackRef}
                onOpen={openPanel}
                onReset={() => {
                  setTriggerVisible(true);
                  setMounted(true);
                  setPanel(null);
                }}
                onToggleFallback={() => setFallback(!fallback)}
              />
              <View style={styles.footer}>
                <Text style={styles.footerText}>@hamster-note/components-native</Text>
                <Text style={styles.footerText}>
                  {t.mode} / {accent}
                </Text>
              </View>
            </View>
          </View>
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
        <Popover {...overlayProps} triggerRef={popoverTrigger} open={panel === 'popover'}>
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

export default function App() {
  return (
    <SafeAreaProvider>
      <Gallery />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  topbar: {
    minHeight: 68,
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8eb',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  topbarCompact: {
    minHeight: 64,
    paddingHorizontal: 20,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#dfdfe5',
    backgroundColor: '#f4f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#625cf5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  brandTitle: {
    color: '#18181b',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  brandSubtitle: {
    color: '#71717a',
    fontSize: 10,
    lineHeight: 14,
  },
  topbarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
  },
  platformDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  platformText: {
    color: '#52525b',
    fontSize: 11,
    fontWeight: '500',
  },
  compactNavWrap: {
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8eb',
    backgroundColor: '#ffffff',
  },
  compactNav: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  scrollContentCompact: {
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  layout: {
    width: '100%',
    maxWidth: 1184,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 48,
  },
  layoutCompact: {
    flexDirection: 'column',
    gap: 0,
  },
  sidebar: {
    width: 192,
    flexShrink: 0,
    gap: 10,
  },
  sidebarLabel: {
    color: '#a1a1aa',
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 1.2,
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  sidebarNav: {
    gap: 4,
  },
  navItem: {
    minHeight: 52,
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navItemCompact: {
    minHeight: 42,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 1,
  },
  navItemActive: {
    backgroundColor: '#ededf9',
    borderColor: '#dfdef4',
  },
  navItemHovered: {
    backgroundColor: '#f0f0f2',
  },
  navItemPressed: {
    opacity: 0.72,
  },
  navLabel: {
    color: '#52525b',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#4f46b8',
    fontWeight: '600',
  },
  navDetail: {
    color: '#a1a1aa',
    fontSize: 10,
    lineHeight: 14,
  },
  navDetailActive: {
    color: '#7770bd',
  },
  focusRing: {
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineColor: '#7c83ff',
    outlineOffset: 2,
  },
  sidebarFooter: {
    marginTop: 24,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e8eb',
    gap: 6,
  },
  sidebarFooterTitle: {
    color: '#52525b',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  sidebarFooterText: {
    color: '#a1a1aa',
    fontSize: 10,
    lineHeight: 16,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  hero: {
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8eb',
    gap: 10,
  },
  heroKicker: {
    color: '#71717a',
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 1.4,
  },
  heroTitle: {
    color: '#18181b',
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: -0.8,
  },
  heroDescription: {
    maxWidth: 560,
    color: '#71717a',
    fontSize: 13,
    lineHeight: 22,
  },
  section: {
    paddingTop: 36,
    gap: 12,
  },
  eyebrow: {
    color: '#71717a',
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  sectionTitle: {
    color: '#18181b',
    fontSize: 23,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  sectionDescription: {
    maxWidth: 640,
    color: '#71717a',
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 8,
  },
  card: {
    padding: 24,
    borderWidth: 1,
    borderColor: '#e8e8eb',
    borderRadius: 12,
    backgroundColor: '#f4f4f5',
    gap: 7,
  },
  cardTitle: {
    color: '#27272a',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  cardDescription: {
    color: '#71717a',
    fontSize: 12,
    lineHeight: 19,
  },
  cardBody: {
    paddingTop: 13,
    gap: 14,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  statusText: {
    color: '#52525b',
    fontSize: 11,
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  statusDivider: {
    color: '#d4d4d8',
    fontSize: 11,
  },
  matrixRow: {
    alignSelf: 'stretch',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  matrixLabel: {
    color: '#a1a1aa',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
  },
  iconFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconFeatureGlyph: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFeatureCopy: {
    gap: 3,
  },
  iconFeatureTitle: {
    color: '#3f3f46',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  iconGrid: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconItem: {
    width: 86,
    minHeight: 72,
    paddingVertical: 11,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e7e7ea',
    backgroundColor: '#ffffff',
  },
  iconName: {
    color: '#71717a',
    fontSize: 10,
    lineHeight: 13,
  },
  liveValue: {
    alignSelf: 'stretch',
    color: '#52525b',
    fontSize: 12,
    lineHeight: 19,
    padding: 10,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  accentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
  },
  accentOptionSelected: {
    borderColor: '#7c83ff',
    backgroundColor: '#f0f0ff',
  },
  accentDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
  },
  accentName: {
    color: '#52525b',
    fontSize: 12,
    lineHeight: 16,
  },
  tokenGrid: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorToken: {
    width: 140,
    padding: 10,
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
  },
  colorSwatch: {
    height: 36,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 3,
  },
  tokenName: {
    color: '#3f3f46',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  tokenValue: {
    color: '#71717a',
    fontSize: 10,
    lineHeight: 16,
  },
  numericToken: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e8e8eb',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerText: {
    color: '#a1a1aa',
    fontSize: 10,
    lineHeight: 16,
  },
});
