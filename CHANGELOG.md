# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
