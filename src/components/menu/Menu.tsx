import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

import { MenuSurface, type MenuSurfaceProps } from './MenuSurface';
import { DEFAULT_MENU_TREE_CONFIG, type MenuPlacement, MenuTreeContext } from './menu-tree-context';

// 子菜单组件与子菜单面板方位类型由内部模块实现，此处统一对外导出，
// 保持 './Menu' 入口的公共 API 不变。
export type { MenuSubmenuProps } from './MenuSubmenu';
export { MenuSubmenu } from './MenuSubmenu';
export type { MenuPlacement } from './menu-tree-context';

// 菜单项的语义色调：default 为常规文字色，danger 用于删除/移除等破坏性操作
export type MenuItemTone = 'default' | 'danger';

export interface MenuProps extends MenuSurfaceProps {
  // 当前 Menu 树中，未局部覆盖的子菜单所使用的期望方位
  readonly submenuPlacement?: MenuPlacement;
  // 当前 Menu 树中，未局部覆盖的子菜单主轴间距（px）
  readonly submenuOffset?: number;
  // 当前 Menu 树中，未局部覆盖的子菜单视口边距（px）
  readonly submenuViewportMargin?: number;
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: ReactNode;
  // 语义色调：danger 会渲染为 --hn-color-danger，用于破坏性操作
  readonly tone?: MenuItemTone;
  // 右侧快捷键提示，任意 ReactNode（字符串、kbd 组合皆可），不参与点击语义
  readonly shortcut?: ReactNode;
}

// hr 隐含 role="separator"（与 PopoverSeparator 一致，不显式写 role）；
// 排除 children 避免 TypeScript 把 hr 当作可放子节点的元素
export type MenuSeparatorProps = Omit<HTMLAttributes<HTMLHRElement>, 'children'>;

export interface MenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  // 分组小标签（如「文件」「编辑」），纯视觉分组，不承担交互语义
  readonly children: ReactNode;
}

// 语义菜单容器：显式使用 <Menu> 即开启一棵新的 Menu 树，
// 子菜单的默认方位 / 间距 / 视口边距通过 MenuTreeContext 下发，
// 内部生成的子菜单面板（MenuSurface）仍保留根上下文、不再开启新树。
export function Menu({
  submenuOffset = DEFAULT_MENU_TREE_CONFIG.submenuOffset,
  submenuPlacement = DEFAULT_MENU_TREE_CONFIG.submenuPlacement,
  submenuViewportMargin = DEFAULT_MENU_TREE_CONFIG.submenuViewportMargin,
  ...props
}: MenuProps) {
  return (
    <MenuTreeContext.Provider value={{ submenuOffset, submenuPlacement, submenuViewportMargin }}>
      <MenuSurface {...props} />
    </MenuTreeContext.Provider>
  );
}

// 菜单项：button + role="menuitem"。
// 默认 type="button"（与 Button 一致，避免在 form 内意外提交）。
// shortcut 存在时用 justify-content: space-between 把快捷键推到右侧。
export function MenuItem({
  children,
  className,
  shortcut,
  tone = 'default',
  type = 'button',
  ...props
}: MenuItemProps) {
  const classes = ['hn-menu__item', `hn-menu__item--${tone}`, className].filter(Boolean).join(' ');

  return (
    <button {...props} className={classes} role="menuitem" type={type}>
      <span className="hn-menu__item-label">{children}</span>
      {shortcut !== undefined && shortcut !== null && shortcut !== '' ? (
        <span className="hn-menu__shortcut">{shortcut}</span>
      ) : null}
    </button>
  );
}

// 分组分隔线：hr 自带 role="separator"，与 PopoverSeparator 行为一致。
// 在 Popover 内继承 --hn-popover-separator；独立使用时退到全局 --hn-color-border。
export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  const classes = ['hn-menu__separator', className].filter(Boolean).join(' ');

  return <hr {...props} className={classes} />;
}

// 分组小标签：纯视觉分组用，不承担交互语义，也不进入 menuitem 序列。
export function MenuLabel({ children, className, ...props }: MenuLabelProps) {
  const classes = ['hn-menu__label', className].filter(Boolean).join(' ');

  return (
    <div {...props} className={classes}>
      {children}
    </div>
  );
}
