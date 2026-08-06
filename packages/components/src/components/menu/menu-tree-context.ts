import { createContext } from 'react';

import type { FloatingPlacement } from '../popover/use-anchor-position';

// 锚定模式下的展开方位（复用 useAnchorPosition 的定义并对外暴露，与 Popover 同范式）
export type MenuPlacement = FloatingPlacement;

export interface MenuTreeConfig {
  readonly submenuOffset: number;
  readonly submenuPlacement: MenuPlacement;
  readonly submenuViewportMargin: number;
}

export const DEFAULT_MENU_TREE_CONFIG: MenuTreeConfig = {
  submenuOffset: 2,
  submenuPlacement: 'right-start',
  submenuViewportMargin: 8,
};

export const MenuTreeContext = createContext<MenuTreeConfig>(DEFAULT_MENU_TREE_CONFIG);
