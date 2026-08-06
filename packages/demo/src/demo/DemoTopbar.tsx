import { Badge, Icon, type ThemeMode } from '@hamster-note/components';

const navigationItems = [
  { href: '#buttons', label: 'Button' },
  { href: '#badges', label: 'Badge' },
  { href: '#fields', label: 'TextField' },
  { href: '#cards', label: 'NoteCard' },
  { href: '#popovers', label: 'Popover' },
  { href: '#menus', label: 'Menu' },
  { href: '#kbds', label: 'Kbd' },
  { href: '#loadings', label: 'Loading' },
  { href: '#icons', label: 'Icon' },
  { href: '#dialogs', label: 'Dialog' },
  { href: '#drawers', label: 'Drawer' },
  { href: '#confirms', label: 'Confirm' },
  { href: '#themes', label: 'Theme' },
  { href: '#comments', label: 'Comments' },
] as const;

interface DemoTopbarProps {
  readonly mode: ThemeMode;
  readonly onModeChange: () => void;
}

export function DemoTopbar({ mode, onModeChange }: DemoTopbarProps) {
  const isDark = mode === 'dark';

  return (
    <header className="topbar">
      <a aria-label="HamsterNote Components 首页" className="brand" href="#top">
        <span aria-hidden="true" className="brand__mark">
          HN
        </span>
        <span>Components</span>
      </a>
      <nav aria-label="组件导航">
        {navigationItems.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="topbar__actions">
        <button
          aria-label={isDark ? '切换到浅色主题' : '切换到深色主题'}
          className="theme-toggle"
          onClick={onModeChange}
          type="button"
        >
          <Icon aria-hidden="true" name={isDark ? 'star' : 'ellipse'} />
          <span>{isDark ? 'Dark' : 'Light'}</span>
        </button>
        <Badge tone="success">v0.1.0</Badge>
      </div>
    </header>
  );
}
