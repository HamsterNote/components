import type { RefObject } from 'react';
import { AccessibilityInfo, findNodeHandle, type View } from 'react-native';
export type FocusTarget = View & { focus?: () => void };
export type FocusRef = RefObject<FocusTarget | null>;
// Host refs become null on unmount. Never cache a handle across an async boundary.
export function focusTarget(ref?: FocusRef) {
  const node = ref?.current;
  if (!node) return false;
  const handle = findNodeHandle(node);
  if (handle == null) return false;
  node.focus?.();
  AccessibilityInfo.setAccessibilityFocus(handle);
  return true;
}
