import { useEffect, useState } from 'react';

import { Button, Kbd, Menu, MenuItem, type MenuPlacement, MenuSubmenu } from '../index';
import { DemoCode } from './DemoCode';
import { placementExampleCode } from './menu-placement-example';

const PLACEMENTS = [
  'top-start',
  'top',
  'top-end',
  'bottom-start',
  'bottom',
  'bottom-end',
  'left-start',
  'left',
  'left-end',
  'right-start',
  'right',
  'right-end',
] as const satisfies readonly MenuPlacement[];

const PLACEMENT_BY_VALUE: Readonly<Record<string, MenuPlacement>> = Object.fromEntries(
  PLACEMENTS.map((placement) => [placement, placement]),
);

const FEATURES = [
  {
    description: '四条主轴 × start / center / end，对齐表达不再受限。',
    metric: '12',
    title: '物理方位',
  },
  {
    description: '空间不足时翻转主方向，并将结果约束在视口内。',
    metric: '2×',
    title: '翻转 + 约束',
  },
  {
    description: '根级默认作用于整棵树，局部覆盖不传给后代。',
    metric: '3 层',
    title: '配置优先级',
  },
  {
    description: '键盘始终右进左出。',
    metric: '→ / ←',
    title: '键盘模型',
  },
] as const;

interface PlacementSelectProps {
  readonly label: string;
  readonly name: string;
  readonly value: MenuPlacement;
  readonly onChange: (placement: MenuPlacement) => void;
}

function PlacementSelect({ label, name, onChange, value }: PlacementSelectProps) {
  return (
    <label className="menu-placement-demo__field">
      <span>{label}</span>
      <select
        aria-label={label}
        name={name}
        onChange={(event) => {
          const nextPlacement = PLACEMENT_BY_VALUE[event.currentTarget.value];
          if (nextPlacement !== undefined) {
            onChange(nextPlacement);
          }
        }}
        value={value}
      >
        {PLACEMENTS.map((placement) => (
          <option key={placement} value={placement}>
            {placement}
          </option>
        ))}
      </select>
    </label>
  );
}

export function MenuPlacementDemo() {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [placement, setPlacement] = useState<MenuPlacement>('bottom-start');
  const [submenuPlacement, setSubmenuPlacement] = useState<MenuPlacement>('right-start');
  const [overridePlacement, setOverridePlacement] = useState<MenuPlacement>('bottom-end');

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        setOpen(false);
        setAnchor(null);
        anchor?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [anchor, open]);

  return (
    <div className="popover-example menu-placement-demo" data-testid="menu-placement-demo">
      <div className="popover-example__header menu-placement-demo__header">
        <div>
          <span className="stage-label">Menu / Placement system</span>
          <h3>多级菜单，方向规则始终清晰</h3>
          <p>支持继承、覆盖与视口避让。</p>
        </div>
      </div>

      <dl aria-label="Menu 方位主要特性" className="menu-placement-demo__features">
        {FEATURES.map((feature) => (
          <div key={feature.title}>
            <dt>
              <strong>{feature.metric}</strong>
              <span>{feature.title}</span>
            </dt>
            <dd>{feature.description}</dd>
          </div>
        ))}
      </dl>

      <div className="menu-placement-demo__workbench">
        <div className="menu-placement-demo__inspector">
          <div className="menu-placement-demo__section-copy">
            <span className="stage-label">Configuration inspector</span>
            <h4>三层方向关系</h4>
            <p>修改任意一层，然后在右侧菜单中观察继承与覆盖。</p>
          </div>

          <div className="menu-placement-demo__controls">
            <PlacementSelect
              label="一级菜单方向"
              name="root-placement"
              onChange={setPlacement}
              value={placement}
            />
            <PlacementSelect
              label="子菜单默认方向"
              name="submenu-placement"
              onChange={setSubmenuPlacement}
              value={submenuPlacement}
            />
            <PlacementSelect
              label="局部覆盖方向"
              name="override-placement"
              onChange={setOverridePlacement}
              value={overridePlacement}
            />
          </div>

          <fieldset aria-label="当前配置关系" className="menu-placement-demo__configuration">
            <span className="menu-placement-demo__configuration-label">root</span>
            <code>{placement}</code>
            <i aria-hidden="true">→</i>
            <span className="menu-placement-demo__configuration-label">tree</span>
            <code>{submenuPlacement}</code>
            <i aria-hidden="true">→</i>
            <span className="menu-placement-demo__configuration-label">local</span>
            <code>{overridePlacement}</code>
          </fieldset>
        </div>

        <div className="menu-placement-demo__scenario">
          <div className="menu-placement-demo__section-copy">
            <span className="stage-label">Live scenario</span>
            <h4>在同一个菜单树中验证全部规则</h4>
            <p>打开菜单，验证继承、深层嵌套和局部覆盖。</p>
          </div>

          <div className="popover-example__surface menu-placement-demo__surface">
            <Button
              aria-controls="placement-demo-menu"
              aria-expanded={open}
              aria-haspopup="menu"
              data-testid="menu-placement-anchor"
              className="menu-placement-demo__trigger"
              onClick={(event) => {
                setAnchor(event.currentTarget);
                setOpen((current) => !current);
              }}
            >
              {open ? '关闭方位菜单' : '打开并验证菜单'}
            </Button>
            {open ? (
              <Menu
                anchor={anchor}
                aria-label="方位设置示例"
                data-testid="menu-placement-panel"
                id="placement-demo-menu"
                placement={placement}
                submenuPlacement={submenuPlacement}
              >
                <MenuItem>一级菜单 / {placement}</MenuItem>
                <MenuSubmenu label="继承子菜单默认方向">
                  <MenuItem>继承 / {submenuPlacement}</MenuItem>
                  <MenuSubmenu label="更深一层">
                    <MenuItem>深层项</MenuItem>
                  </MenuSubmenu>
                </MenuSubmenu>
                <MenuSubmenu label="仅此层局部覆盖" placement={overridePlacement}>
                  <MenuItem>覆盖 / {overridePlacement}</MenuItem>
                </MenuSubmenu>
              </Menu>
            ) : null}
          </div>

          <div className="menu-placement-demo__keyboard">
            <span>键盘路径</span>
            <Kbd>→</Kbd>
            <span>进入</span>
            <Kbd>←</Kbd>
            <span>返回一层</span>
            <Kbd>Esc</Kbd>
            <span>关闭</span>
          </div>
        </div>
      </div>

      <p className="menu-placement-demo__note">
        <strong className="menu-placement-demo__note-label">视口保障：</strong>
        空间不足时翻转主方向，
        <span className="menu-placement-demo__term">保留 start / center / end 对齐</span>；
        <span className="menu-placement-demo__term">最终由 viewport margin 限定</span>。
      </p>
      <DemoCode code={placementExampleCode} />
    </div>
  );
}
