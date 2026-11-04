import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { Pressable, Text, View } from 'react-native';
import { Popover, type PopoverProps } from './popover';
import { useTheme } from './theme';
export interface MenuItemProps {
  children: ReactNode;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  shortcut?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}
export interface MenuSubmenuProps {
  label: string;
  children: ReactNode;
  disabled?: boolean;
}
export function MenuItem(_props: MenuItemProps) {
  return null;
}
export function MenuSubmenu(_props: MenuSubmenuProps) {
  return null;
}
export function MenuLabel(_props: { children: ReactNode }) {
  return null;
}
export function MenuSeparator() {
  return null;
}
export interface MenuProps extends Omit<PopoverProps, 'onBack' | 'initialFocusRef' | 'focusKey'> {}
interface Entry {
  key: string;
  kind: 'item' | 'submenu' | 'label' | 'separator';
  props: MenuItemProps & { label?: string };
  children?: Entry[];
}
function parse(children: ReactNode, prefix = ''): Entry[] {
  return Children.toArray(children).flatMap((child, index) => {
    if (!isValidElement(child)) return [];
    const key = `${prefix}/${index}`;
    if (child.type === Fragment)
      return parse((child.props as { children: ReactNode }).children, key);
    if (child.type === MenuItem)
      return [{ key, kind: 'item' as const, props: child.props as MenuItemProps }];
    if (child.type === MenuSubmenu) {
      const props = child.props as MenuSubmenuProps;
      return [{ key, kind: 'submenu' as const, props, children: parse(props.children, key) }];
    }
    if (child.type === MenuLabel)
      return [{ key, kind: 'label' as const, props: child.props as MenuItemProps }];
    if (child.type === MenuSeparator)
      return [{ key, kind: 'separator' as const, props: { children: null } }];
    throw new Error('Menu children must be MenuItem, MenuSubmenu, MenuLabel or MenuSeparator.');
  });
}
export function Menu({ children, open, onClose, ...props }: MenuProps) {
  const t = useTheme();
  const [path, setPath] = useState<string[]>([]);
  const [returnKey, setReturnKey] = useState<string | null>(null);
  const firstRef = useRef<View>(null);
  const consumed = useRef(false);
  const live = useRef(open);
  live.current = open;
  useEffect(() => {
    if (!open) {
      setPath([]);
      setReturnKey(null);
    } else consumed.current = false;
  }, [open]);
  let entries = parse(children);
  const labels: string[] = [];
  for (const key of path) {
    const entry = entries.find((e) => e.key === key && e.kind === 'submenu');
    if (!entry) break;
    labels.push(entry.props.label ?? '');
    entries = entry.children ?? [];
  }
  const focusEntry =
    entries.find((e) => e.key === returnKey && !e.props.disabled) ??
    entries.find((e) => (e.kind === 'item' || e.kind === 'submenu') && !e.props.disabled);
  const back = () => {
    if (!path.length) return false;
    setReturnKey(path[path.length - 1] ?? null);
    setPath(path.slice(0, -1));
    return true;
  };
  const close = () => {
    if (!consumed.current && live.current) {
      consumed.current = true;
      onClose();
    }
  };
  return (
    <Popover
      {...props}
      open={open}
      onClose={close}
      onBack={back}
      initialFocusRef={firstRef}
      focusKey={`${path.join(':')}:${returnKey ?? ''}`}
    >
      {path.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="返回上一级"
          onPress={back}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={{ color: t.colors.text }}>‹ {labels[labels.length - 1]}</Text>
        </Pressable>
      ) : null}
      <View accessibilityRole="menu">
        {entries.map((e) =>
          e.kind === 'separator' ? (
            <View
              key={e.key}
              style={{ height: 1, backgroundColor: t.colors.border, marginVertical: 4 }}
            />
          ) : e.kind === 'label' ? (
            <Text
              key={e.key}
              accessibilityRole="header"
              style={{ color: t.colors.textMuted, padding: 8, fontSize: t.fontSize.small }}
            >
              {e.props.children}
            </Text>
          ) : (
            <Pressable
              key={e.key}
              ref={e.key === focusEntry?.key ? (firstRef as RefObject<View>) : undefined}
              accessibilityRole="menuitem"
              accessibilityLabel={e.props.accessibilityLabel ?? e.props.label}
              accessibilityState={{
                disabled: Boolean(e.props.disabled),
                ...(e.kind === 'submenu' ? { expanded: false } : {}),
              }}
              disabled={e.props.disabled}
              onPress={() => {
                if (e.props.disabled || consumed.current || !live.current) return;
                if (e.kind === 'submenu') {
                  setReturnKey(null);
                  setPath([...path, e.key]);
                } else {
                  consumed.current = true;
                  try {
                    e.props.onPress?.();
                  } finally {
                    onClose();
                  }
                }
              }}
              style={({ pressed }) => ({
                minHeight: 44,
                padding: 10,
                borderRadius: t.radius.small,
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: pressed ? t.colors.surfaceHover : 'transparent',
                opacity: e.props.disabled ? 0.42 : 1,
              })}
            >
              <Text
                style={{
                  color: e.props.tone === 'danger' ? t.colors.danger : t.colors.text,
                  fontSize: t.fontSize.large,
                  flexShrink: 1,
                }}
              >
                {e.kind === 'submenu' ? e.props.label : e.props.children}
              </Text>
              {e.kind === 'submenu' || e.props.shortcut ? (
                <Text style={{ color: t.colors.textMuted }}>
                  {e.kind === 'submenu' ? '›' : e.props.shortcut}
                </Text>
              ) : null}
            </Pressable>
          ),
        )}
      </View>
    </Popover>
  );
}
