# HamsterNote Components Design System

## 0. Research Log

- Embedded references shortlisted: Linear, Raycast, and Vercel. Linear was selected because its
  operational density, restrained hierarchy, and precise state language fit a component workbench.
- Layer A: `taste-skill.md` for a quiet, useful developer surface rather than a marketing page.
- Layer B: `linear.app.md` for cold neutral layering, thin separators, compact labels, and a single
  interaction accent. Brand marks, copy, and proprietary visual motifs are intentionally excluded.
- Lazyweb product-screen research was skipped because the anonymous-token integration is unavailable
  in this workspace. The embedded reference corpus provides sufficient component-workbench grammar.
- Imagen drafts were skipped because no image-generation integration is available. This project is a
  tool surface whose quality depends on live states and responsive behavior rather than static imagery.

## 1. Intent and Principles

The Demo is a working instrument for engineers evaluating reusable primitives. It should feel exact,
calm, and inspectable. Visual hierarchy comes from spacing, brightness, and borders rather than large
decorative treatments. Every effect communicates interactivity, state, or grouping.

## 2. Color Tokens

- Canvas: `#09090b`; raised canvas: `#0d0d10`; panel: `rgba(255, 255, 255, 0.035)`.
- Strong text: `#f4f4f5`; body text: `#b4b4bd`; muted text: `#777783`.
- Border: `rgba(255, 255, 255, 0.09)`; strong border: `rgba(255, 255, 255, 0.16)`.
- Accent: `#7c83ff`; accent hover: `#9197ff`; accent wash: `rgba(124, 131, 255, 0.12)`.
- Info: `#aeb2ff`; success: `#4ade80`; warning: `#fbbf24`; danger: `#fb7185`. Filled
  semantic actions use `#09090b` labels by default; light-mode danger uses `#ffffff` to preserve
  WCAG AA contrast at the 13px label size. Danger also owns a mode-aware hover token: dark mode
  brightens to `#fc8a9b`, while light mode deepens to `#be123c` so its white label remains AA.
- Focus ring: `rgba(145, 151, 255, 0.42)`. Accent is reserved for focus and primary actions.

## 3. Typography

- UI sans: `"IBM Plex Sans", "Noto Sans SC", sans-serif`; code: `"IBM Plex Mono", monospace`.
- Display: 44/48 at desktop, 34/39 on mobile, weight 520, tracking -0.035em.
- Heading: 18/26, weight 550. Body: 14/22. Label: 12/16, weight 550, tracking 0.02em.
- Metadata and code labels use the mono family at 11–12px; all long copy remains in the sans family.

## 4. Spacing and Layout

- Base spacing unit: 4px. Primary steps: 8, 12, 16, 24, 32, 48, 72px.
- Content max width: 1200px. Desktop gutter: 32px; tablet: 24px; mobile: 16px.
- Demo sections use a 240px annotation column and flexible preview stage above 900px, then stack.
- Density stays compact inside components while page sections retain generous vertical separation.

## 5. Component Primitives

- Buttons: 36px default height, 8px radius, semibold 13px label, clear default/hover/active/focus/
  disabled states. Primary is filled accent; danger, warning, success, and info are peer-level filled
  semantic actions matching the four colored Badge states; secondary is neutral. Ghost is an
  orthogonal boolean presentation modifier rather than a variant: it removes the surface while using
  the selected variant's action color for its label and hover wash. Semantic ghost labels mix the
  action color 45% toward the current theme text token, preserving their hue while maintaining
  readable contrast on both light and dark surfaces; ghost without an explicit variant inherits the
  neutral secondary treatment.
- Badge: inline status label with 6px radius, compact 11px type, and semantic color wash.
- TextField: persistent visible label, optional hint/error, 38px control, 8px radius, strong focus ring.
- NoteCard: semantic article with title, excerpt, metadata, and selected state; never a decorative card.
- Popover: compact, content-agnostic overlay surface with explicit `dark` (default) and `light`
  themes. The dark theme preserves the Notes editor toolbar treatment; the light theme uses an
  equally legible neutral surface. The outer radius is `calc(var(--hn-radius-md) + padding)` so the
  embedded `Button` radius shares the same center, producing a concentric corner. A semantic
  separator groups related actions without adding visual noise; its `aria-orientation` and visual
  axis follow the Popover's `orientation` prop (horizontal popover → vertical separator; vertical
  popover → horizontal separator). An optional `edge`/`edgeOffset` prop pair lets the surface be
  used standalone, pinned to a viewport edge with `position: fixed`, without changing the default
  consumer-owned anchoring philosophy. Anchoring, open state, focus return, and dismissal remain
  consumer-owned so the primitive works with toolbars, menus, and contextual help without imposing
  the wrong pattern.
- Menu: a vertical `role="menu"` list with `MenuItem` (`role="menuitem"`), `MenuLabel`, and
  `MenuSeparator`. The menu intentionally defines no menu-specific color tokens: text, muted text,
  hover surface, and danger all reference the global `--hn-color-*` tokens, so when a Menu is
  embedded in a Popover it automatically inherits the Popover's local `dark`/`light` overrides
  without a theme prop. Passing `anchor` switches the Menu into an anchored mode that mirrors
  Popover's: it portals to `document.body`, positions itself with flip/clamp, and gains the
  `.hn-menu--floating` surface — border, shadow, and self-contained `dark` token overrides (with
  an optional `data-theme="light"` variant) — because a portaled menu can no longer inherit those
  overrides through the cascade. `.hn-menu` therefore serves as the floating outer layer directly,
  with no Popover wrapper; `MenuSubmenu`'s panel is one such anchored Menu. `MenuSeparator` uses `var(--hn-popover-separator, var(--hn-color-border))`
  so it inherits the Popover separator variable inside a Popover and falls back to the global
  border color when used standalone. `MenuItem` supports a `shortcut` node rendered with the mono
  font family and a `tone="danger"` variant that switches the label color to `--hn-color-danger`.
  Keyboard navigation (roving tabindex, arrow keys), nested submenus, and checkbox/radio items are
  intentionally out of scope; the library philosophy is that presentation and semantics belong to
  the component while behavior stays consumer-owned.
- Kbd: a presentational key-cap component for shortcut hints. The outer `<kbd class="hn-kbd">` is a
  semantic inline-flex container; each key cap is a nested `<kbd class="hn-kbd__key">` (HTML spec
  recommends nested `<kbd>` to express combined keys). `keys` renders a combo sequence with small
  `+` separators (`<span class="hn-kbd__plus">`, no key-cap styling); `children` renders a single
  key cap. `keys` takes precedence over `children`. The key cap uses `--hn-font-mono` at 11px,
  compact `2px 6px` padding, `--hn-radius-sm` corners, a 1px border derived from
  `color-mix(in srgb, var(--hn-color-text) 22%, transparent)`, a `--hn-color-surface-hover`
  background, and a subtle `inset 0 -1px 0 0 rgb(0 0 0 / 12%)` shadow for a restrained key-cap
  tactile feel. All colors reference global tokens, so a Kbd embedded in a Popover (or used as a
  `MenuItem` `shortcut` inside a Menu inside a Popover) automatically inherits the Popover's local
  `dark`/`light` overrides without a theme prop. The component has no interaction, no `role=button`,
  and no size/tone variants by design — it is a pure visual primitive.
- Dialog: a controlled modal dialog rendered via Portal to `document.body` (with an SSR guard
  mirroring Popover's anchored mode). It shares a single `useModal` hook with Drawer for focus
  management (focus moves to the first focusable element on open, returns to the previously focused
  element on close, Tab/Shift+Tab cycles within the panel), body scroll lock (save/restore
  `document.body.style.overflow`), Esc and backdrop dismissal (`closeOnEsc` / `closeOnBackdrop`,
  both default true), and an enter/exit animation state machine (`entering` → `open` → `leaving` →
  `closed`) that keeps the element mounted during the 180ms exit transition while the public API
  stays controlled-only (`open` / `onClose`). The surface uses `--hn-color-surface` background,
  `--hn-color-border` 1px border, `--hn-radius-lg` corners, a `rgb(0 0 0 / 45%)` backdrop with 8px
  blur, opacity + 8px translateY motion (140ms opacity / 180ms transform,
  `cubic-bezier(.2,.8,.2,1)`, `prefers-reduced-motion` aware), `role="dialog"` + `aria-modal=true`,
  and `aria-labelledby`/`aria-describedby` wired from `useId` to optional `title`/`description`.
  Because the Portal leaves the ThemeProvider DOM subtree, the provider exposes its resolved
  accent/mode through React context and the Dialog recreates a theme scope at the portal root; theme
  switching therefore remains live without copying computed styles. Optional `showCloseButton` and
  `showFullscreenButton` props add compact labelled icon buttons at the top-right (fullscreen first,
  close last). Fullscreen is component-owned presentation state, resets on close, and swaps the panel
  between its constrained centered silhouette and a viewport-filling surface without changing the
  consumer-owned `open` contract.
  z-index 1100 sits above Popover's 1000 so a dialog correctly overlays menus and anchored
  popovers.
- Drawer: a controlled edge-attached modal panel that reuses the same `useModal` behavior as Dialog.
  `placement` (`left` / `right` / `top` / `bottom`, default `right`) controls which edge the panel
  slides from and its sizing axis: left/right are full-height columns with a 360px default width,
  top/bottom are full-width bars with a 280px default height, both overridable via the `size` prop
  (px) which is injected as the `--hn-drawer-size` CSS variable. Corners are rounded only on the two
  edges away from the attached side, producing a "slides in from the edge" silhouette. Motion is
  translateX (left/right) or translateY (top/bottom) with the same 180ms / 140ms / easing / reduced
  motion contract as Dialog. z-index 1200 sits above Dialog's 1100: when a Drawer opens a Dialog
  the Dialog stays visible, and when a Dialog opens a Drawer the Drawer overlays the Dialog,
  matching the intuition that a drawer is a higher-level container. It uses the same React-context
  portal theme bridge as Dialog. Optional `showCloseButton` adds a labelled icon action at the
  top-right. Optional `showFullscreenButton` adds an upward-arrow action immediately before the title
  at the top-left. The title header is the drag surface: a vertical upward gesture of at least 56px
  promotes the adaptive detent to fullscreen, while a downward gesture of at least 56px restores the
  adaptive detent. Pointer capture keeps the gesture continuous outside the header. The two detents
  are discrete and animate only transform/opacity; side drawers expand their width to the viewport,
  while top/bottom drawers expand their height. The adaptive `size` remains the restoration target.
  Viewport attachment uses dynamic viewport units, safe-area insets on every edge, and contained
  overscroll so mobile browser chrome and notches never cover the header, content, or composer.
- Confirm: a confirmation dialog built on top of Dialog, exposed in three equivalent forms that
  share one presentational core (`<Confirm>`): a controlled `<Confirm>` component, a
  `<ConfirmProvider>` + `useConfirm()` hook returning `confirm(options): Promise<boolean>`, and a
  pure `confirm(options): Promise<boolean>` function that lazily creates a container and a
  `react-dom/client` `createRoot` for callers outside any Provider tree (SSR guards resolve `false`
  with a `console.warn`). The footer is a right-aligned ghost cancel plus a confirm action reusing
  `Button`; `tone="danger"` selects Button's danger variant, while the default tone selects primary.
  `loading` disables both buttons and rewrites the confirm label to
  "处理中…". The Provider uses a latest-wins queue: a new request resolves any pending request with
  `false` before mounting itself, so the UI always shows the latest confirm and no Promise ever
  hangs.
- Comment Drawer (Pro): a collaboration panel composed directly from the foundation Drawer. It
  accepts a typed `data` collection and presents a compact chronological comment list, author
  metadata, a single-level flat reply thread, an empty state, and labelled composers. Comments and
  replies expose semantic reply actions that share one inline composer; replying to a reply records
  and displays its target while appending the result to the root comment's same reply list. Replies
  use an indented border and the foundation surface tokens rather than deeper nested cards.
  Submissions containing only whitespace stay
  disabled; successful comment and reply submissions append to their respective visible lists,
  clear the active composer, return focus to the reply trigger, and announce concise outcomes through
  a dedicated polite status region portalled outside the modal tree rather than making the entire
  feed live. Each outcome replaces the status message node so repeated actions remain observable to
  assistive technology. Reply callbacks expose
  the complete typed reply for persistence, and a
  matching stable ID in updated `data` reconciles the local optimistic item without duplication.
  Optional typed edit/delete callbacks expose the root comment ID and, for replies, the reply ID.
  Editing replaces the item content optimistically in place through a labelled inline editor; blank
  content cannot be saved, and cancel preserves the previous value. Edit and delete controls are only
  rendered when their matching callback is provided. Destructive actions always open a danger-tone
  Confirm that names whether a comment or reply will be removed; cancellation leaves the thread
  unchanged, while confirmation removes the target immediately without removing sibling entries.
- Demo panels: 12px radius, 1px border, subtle directional highlight, no floating drop-shadow stack.

## 6. Motion and Interaction

- Transitions: 140ms for color/opacity and 180ms for transform. Easing: `cubic-bezier(.2,.8,.2,1)`.
- Interactive controls may move up by 1px on hover and return on active. Non-interactive surfaces do
  not animate. Page entrance uses opacity and translateY only, once, and respects reduced motion.
- Keyboard focus is always visible through a 3px focus ring. Disabled controls never animate.

## 7. Responsive and Accessibility Constraints

- Breakpoints are content-driven: 900px for section stacking and 640px for compact header/actions.
- Touch targets are at least 36px for compact developer controls and 44px for isolated mobile actions.
- Semantic landmarks, real labels, button elements, `aria-live` feedback, and sufficient contrast are
  required. Color is never the only carrier of state. The interface supports 200% text zoom without
  clipped content and honors `prefers-reduced-motion`.
- Comment Drawer keeps the composer label visible, associates it with the textarea, disables submit
  for trimmed-empty content, and exposes newly added comments and replies through a polite live
  region. Comment and reply triggers identify the target author, reflect expanded state, meet the 36px compact
  target minimum (44px on mobile), and regain focus after submit or cancel; reply composers keep a
  visible target label. Comment and reply timestamps use semantic `<time>` elements and the Drawer
  hosts the destructive Confirm as its only nested modal. Edit/delete icon actions carry author- and
  entry-specific accessible names, retain visible focus treatment, and meet the same 36px/44px target
  minimums as reply actions.
- Popover consumers must choose the ARIA role that matches their content and connect trigger and
  surface with `aria-controls`/`aria-expanded`. `PopoverSeparator` always exposes `role="separator"`
  and an `aria-orientation` that follows the surrounding Popover's `orientation`: `vertical`
  separator in a horizontal (default) popover, `horizontal` separator in a vertical popover.
  When `PopoverSeparator` is used standalone (no Popover ancestor), it keeps the default
  `aria-orientation="vertical"`. Separator contrast must remain visible in both themes and both
  orientations.
- Menu consumers must set `aria-haspopup="menu"` on the trigger and connect it to the menu surface
  with `aria-controls`/`aria-expanded`. The `Menu` container exposes `role="menu"` and each
  `MenuItem` exposes `role="menuitem"`. `MenuSeparator` relies on the implicit `role="separator"`
  of `<hr>` and must not be used as the only visual grouping signal inside a long menu.
  `MenuLabel` is a presentational group label and is not exposed as a `group`/`aria-label`; when a
  menu needs formal group semantics the consumer wraps `MenuItem`s in a `role="group"` with an
  accessible name. The library intentionally does not implement keyboard navigation (arrow keys,
  roving tabindex), so consumers are responsible for focus movement, dismissal, and focus return.
- Dialog and Drawer expose `role="dialog"` + `aria-modal="true"` on the panel and connect optional
  `title`/`description` via `aria-labelledby`/`aria-describedby` generated from `useId`. When
  `title` is omitted the consumer must supply `aria-label`. Focus is trapped inside the panel
  (Tab/Shift+Tab cycle), moved to the first focusable element on open, and returned to the
  previously focused element on close; when an action removes that element, `finalFocusRef` names a
  stable fallback that receives focus after the parent modal becomes interactive again. Body scroll
  is locked while open. Esc and backdrop dismissal
  are on by default and individually toggleable via `closeOnEsc`/`closeOnBackdrop`. Enter/exit
  motion respects `prefers-reduced-motion`. Confirm reuses Dialog's semantics; the confirm button
  is the primary action and the cancel button is the dismissal path, so Esc/backdrop both resolve
  the hook/function Promise with `false`. Dialog and Confirm use the default overlay layer unless a
  second modal is opened from an existing Drawer or modal surface; that child explicitly selects the
  semantic `elevated` layer so both its backdrop and panel sit above the parent without exposing a
  consumer-controlled numeric z-index. Only the topmost modal remains `aria-modal` and interactive;
  each covered parent is `aria-hidden` and inert until the child finishes leaving. Their icon actions
  are native `button` elements with visible
  focus rings, 36px minimum targets, stable Chinese `aria-label` text, and `aria-pressed` on fullscreen
  toggles. Drawer drag is additive rather than exclusive: keyboard and assistive-technology users can
  always reach the same fullscreen state through the arrow button when that action is enabled.

## 8. Accepted Debt and Handoff

- Web fonts are loaded from a public font CDN for the Demo; package consumers receive no font side
  effects and should supply their own font stack. A self-hosted font path can replace this before an
  offline Demo release.
- The first release documents components through the live workbench rather than a generated API docs
  site. Public props remain visible through emitted TypeScript declarations.
- Future components must reuse these tokens, export a typed public API, include keyboard/focus states,
  and appear in the Demo before release. Kbd is an exception: as a pure presentational primitive it
  intentionally has no interactive states and no ARIA widget role, so the keyboard/focus requirement
  does not apply to it.
