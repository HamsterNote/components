import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ThemeProvider, useTheme } from './theme';
import { focusTarget, type FocusRef } from './focus';
import { placePanel, type Placement, type Rect } from './position';
export type { FocusRef, FocusTarget } from './focus';
export type { Placement } from './position';
export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  accessibilityLabel: string;
  anchorRef?: RefObject<View | null>;
  triggerRef?: FocusRef;
  fallbackFocusRef?: FocusRef;
  initialFocusRef?: FocusRef;
  /** Wrap only the host background in this View; keep Modal outside that View. */
  backgroundRef?: RefObject<View | null>;
  placement?: Placement;
  anchorOffset?: number;
  viewportMargin?: number;
  /** Supply host safe-area insets (e.g. useSafeAreaInsets); library has no Expo dependency. */
  safeAreaInsets?: { top: number; right: number; bottom: number; left: number };
  style?: StyleProp<ViewStyle>;
  onBack?: () => boolean;
  focusKey?: string;
  closeLabel?: string;
}
export function Popover({
  open,
  onClose,
  children,
  accessibilityLabel,
  anchorRef,
  triggerRef,
  fallbackFocusRef,
  initialFocusRef,
  backgroundRef,
  placement = 'bottom',
  anchorOffset = 8,
  viewportMargin = 12,
  safeAreaInsets,
  style,
  onBack,
  focusKey = '',
  closeLabel = '关闭',
}: PopoverProps) {
  const theme = useTheme();
  const dimensions = useWindowDimensions();
  const titleRef = useRef<Text>(null);
  const closeRef = useRef<View>(null);
  const mounted = useRef(true);
  const closeRequested = useRef(false);
  const generation = useRef(0);
  const frames = useRef(new Set<number>());
  const wasOpen = useRef(false);
  const shown = useRef(false);
  const laidOut = useRef(false);
  const focusedKey = useRef<string | null>(null);
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [panel, setPanel] = useState({ width: 280, height: 100 });
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);
  const liveOpen = useRef(open);
  liveOpen.current = open;
  const schedule = useCallback((fn: () => void) => {
    if (!mounted.current) return;
    const epoch = generation.current;
    const id = requestAnimationFrame(() => {
      frames.current.delete(id);
      if (mounted.current && generation.current === epoch) fn();
    });
    frames.current.add(id);
  }, []);
  const enterFocus = useCallback(() => {
    if (shown.current && laidOut.current && liveOpen.current && focusedKey.current !== focusKey)
      schedule(() => {
        if (liveOpen.current) {
          focusedKey.current = focusKey;
          if (!focusTarget(initialFocusRef))
            focusTarget(titleRef as FocusRef) || focusTarget(closeRef);
        }
      });
  }, [initialFocusRef, schedule, focusKey]);
  const restore = useCallback(() => {
    if (!liveOpen.current)
      schedule(() => {
        if (!liveOpen.current) focusTarget(triggerRef) || focusTarget(fallbackFocusRef);
      });
  }, [schedule, triggerRef, fallbackFocusRef]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
      frames.current.forEach(cancelAnimationFrame);
      frames.current.clear();
    };
  }, []);
  useEffect(() => {
    generation.current++;
    frames.current.forEach(cancelAnimationFrame);
    frames.current.clear();
    if (open) {
      closeRequested.current = false;
      wasOpen.current = true;
      shown.current = false;
      laidOut.current = false;
      focusedKey.current = null;
    } else if (wasOpen.current) {
      wasOpen.current = false;
      if (Platform.OS !== 'ios') restore();
    }
  }, [open, restore]);
  useEffect(() => {
    if (!open) return;
    const bg = backgroundRef?.current;
    bg?.setNativeProps({
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    });
    return () => {
      if (backgroundRef?.current !== bg) return;
      bg?.setNativeProps({ accessibilityElementsHidden: false, importantForAccessibility: 'auto' });
    };
  }, [open, backgroundRef]);
  useEffect(() => {
    if (!open) {
      setKeyboardTop(null);
      return;
    }
    setKeyboardTop(Keyboard.metrics()?.screenY ?? null);
    const show = Keyboard.addListener('keyboardDidShow', (e) =>
      setKeyboardTop(e.endCoordinates.screenY),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardTop(null));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [open]);
  const insets = safeAreaInsets ?? {
    top: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  const bounds = {
    x: insets.left + viewportMargin,
    y: insets.top + viewportMargin,
    width: Math.max(1, dimensions.width - insets.left - insets.right - 2 * viewportMargin),
    height: Math.max(
      1,
      Math.min(dimensions.height - insets.bottom, keyboardTop ?? dimensions.height) -
        insets.top -
        2 * viewportMargin,
    ),
  };
  useEffect(() => {
    if (!open) return;
    let active = true;
    const node = anchorRef?.current;
    if (!node) setAnchor(null);
    else
      node.measureInWindow((x, y, width, height) => {
        if (active && mounted.current && liveOpen.current && anchorRef.current === node)
          setAnchor({ x, y, width, height });
      });
    return () => {
      active = false;
    };
  }, [
    open,
    anchorRef,
    dimensions.width,
    dimensions.height,
    keyboardTop,
    insets.top,
    insets.right,
    insets.bottom,
    insets.left,
    focusKey,
  ]);
  useEffect(() => {
    if (open) enterFocus();
  }, [focusKey, open, enterFocus]);
  const requestClose = () => {
    if (!mounted.current || !liveOpen.current || closeRequested.current) return;
    if (onBack?.()) return;
    closeRequested.current = true;
    onClose();
  };
  const position = placePanel(
    anchor,
    { width: Math.min(panel.width, bounds.width), height: Math.min(panel.height, bounds.height) },
    bounds,
    placement,
    anchorOffset,
  );
  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      statusBarTranslucent
      onShow={() => {
        shown.current = true;
        enterFocus();
      }}
      onDismiss={restore}
      onRequestClose={requestClose}
    >
      <ThemeProvider theme={theme}>
        <View
          style={StyleSheet.absoluteFill}
          accessibilityViewIsModal
          onAccessibilityEscape={requestClose}
        >
          <Pressable
            accessible={false}
            importantForAccessibility="no"
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]}
            onPress={requestClose}
          />
          <View
            onLayout={(e) => {
              setPanel(e.nativeEvent.layout);
              laidOut.current = true;
              enterFocus();
            }}
            style={[
              {
                position: 'absolute',
                width: Math.min(320, bounds.width),
                maxWidth: bounds.width,
                maxHeight: bounds.height,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.large,
                borderWidth: 1,
                borderColor: theme.colors.border,
                zIndex: theme.layer.popover,
                padding: theme.spacing.panelPadding,
              },
              style,
              { ...position, maxWidth: bounds.width, maxHeight: bounds.height },
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                ref={titleRef}
                accessible
                accessibilityRole="header"
                style={{ color: theme.colors.text, fontSize: theme.fontSize.large, flexShrink: 1 }}
              >
                {accessibilityLabel}
              </Text>
              <Pressable
                ref={closeRef}
                accessibilityRole="button"
                accessibilityLabel={closeLabel}
                onPress={requestClose}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: theme.colors.text }}>×</Text>
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ gap: 4 }}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </ThemeProvider>
    </Modal>
  );
}
