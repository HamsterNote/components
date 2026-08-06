# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-08-06

### Added

- **Menu**: 12-direction placement with configurable submenu inheritance and interactive demo.
- **Dialog/Drawer**: unified fullscreen icons (`fullscreen`, `fullscreen-exit`) and comment icon.
- **Drawer**: fullscreen drag interaction (drag title area to enter/exit fullscreen).
- **Button**: semantic variants (`primary`, `secondary`, `danger`, `warning`, `success`, `info`) with `ghost` boolean prop.
- **Theme**: `ThemeContext` for programmatic theme access.
- **Icon**: `comment`, `fullscreen`, `fullscreen-exit` icons added.
- **Testing**: Vitest unit tests and Playwright e2e tests with visual regression baselines.
- **CI**: GitHub Pages deployment workflow for demo, Node.js 22 support, CJK font installation for visual tests.
- **Documentation**: comprehensive README with badges, install, testing, and demo sections; comment permission vocabulary and ADR.

### Changed

- **Menu**: dropdown menus no longer wrap a `Popover` — `Menu` gains an anchored mode (as in v0.2.1-beta.3), now with 12-direction placement and configurable submenu inheritance.
- **Build**: demo build uses `/components/` base path.

### Fixed

- **Menu**: submenu Escape handling improved, icon count updated.

## [0.2.1-beta.4] - 2026-07-25

### Fixed

- **Menu demo**: pressing Escape inside a submenu now closes only that submenu and returns focus to its trigger, without also closing the root menu.
- **Icon demo**: the section description now reports the complete set of 55 icons.

## [0.2.1-beta.3] - 2026-07-25

### Added

- **Icon**: `minimap`, `font-size`, and `drag` icons — 55 outline icons total.

### Changed

- **Menu**: dropdown menus no longer wrap a `Popover` — `Menu` gains an anchored mode (`anchor` / `placement` / `anchorOffset` / `anchorCrossOffset` / `viewportMargin` / `ref`, mirroring Popover's anchored API) and `.hn-menu` itself becomes the floating surface via `.hn-menu--floating` (self-contained border, shadow, and dark token overrides, optional `data-theme="light"`). `MenuSubmenu`'s panel is now an anchored `Menu` directly.

## [0.2.1-beta.2] - 2026-07-22

## [0.2.1-beta.1] - 2026-07-22

### Added

- **Icon**: `polygon` (多边形) and `lasso` (套索) icon — 52 outline icons total.

## [0.2.1-beta] - 2026-07-22

### Added

- **Popover**: `relative` prop for edge mode — positions the surface with `position: absolute` against the nearest positioned ancestor instead of `fixed` against the viewport.

### Fixed

- **Styles**: `backdrop-filter` declaration order (`-webkit-` prefixed first, standard property last) in Popover, Menu, Dialog, Drawer, and Loading, so the standard property survives build minification and no longer reports an invalid property value in browsers without `-webkit-` prefix support.

## [0.2.0] - 2026-07-21

### Added

- **Button**: `primary`, `secondary`, `ghost` three-tier button with three sizes.
- **Badge**: `neutral`, `accent`, `success`, `warning`, `danger` five semantic states.
- **TextField**: persistent label, helper text, error state, full native input passthrough.
- **NoteCard**: static semantic article card and interactive selectable card.
- **Icon**: SVG icon component with a preset icon set (80+ icons), size and color token support.
- **Kbd**: presentational keyboard keycap component with combo key sequence rendering.
- **Popover**: dark/light theme floating surface with semantic `PopoverSeparator`, anchor mode (Portal to body, viewport collision detection, auto-flip, scroll/resize reposition).
- **Menu**: `role="menu"` semantic menu list with `MenuItem` (shortcut, danger tone), `MenuLabel`, `MenuSeparator`, and `MenuSubmenu` (nested submenu with Portal, auto-flip, hover/click toggling, keyboard navigation).
- **Dialog**: controlled modal dialog with focus trap, scroll lock, Esc/backdrop close, enter/exit animation (`prefers-reduced-motion` aware), Portal to body.
- **Drawer**: edge-attached modal drawer with `left`/`right`/`top`/`bottom` placement and configurable size.
- **Confirm**: confirmation dialog in three forms — controlled `<Confirm>`, `<ConfirmProvider>` + `useConfirm()` hook (Promise-based, latest-wins concurrency), and standalone `confirm()` function (lazy React root, SSR-safe).
- **Loading**: spinning indicator with an embedded `loading()` fullscreen helper.
- **ThemeProvider**: accent color and dark/light mode switching via CSS token overriding; `display: contents` wrapper, nested overrides, preset theme colors (`violet`/`blue`/`teal`/`orange`/`pink`) and custom color support.
- **Entry points**: barrel `index.ts` export and tree-shakable per-component sub-path exports (`@hamster-note/components/button`, etc.).
- **CSS tokens**: a global `tokens.css` with `--hn-*` custom properties for colors, radii, spacing, and typography.
- **Demo app**: full component demo with interactive examples and responsive layout.
- **CI workflows**: GitHub Actions for PR checks, npm publish (tag-triggered), and master-to-dev branch sync.
- **Documentation**: comprehensive README with usage examples for every component.
