import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Button,
  Icon,
  ICON_NAMES,
  Menu,
  MenuItem,
  MenuSubmenu,
  Popover,
  TextField,
  ThemeProvider,
  type ButtonSize,
  type ButtonVariant,
  type ThemeAccentPreset,
} from '../index';
import data from '../../fixtures/cross-platform.json';
// Web Popover is a surface. This consumer owns open/close and focus.
export function CrossPlatformDemo() {
  const [count, setCount] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState(data.initialText);
  const [raw, setRaw] = useState(data.initialText);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<'dark' | 'light'>('dark');
  const [accent, setAccent] = useState<ThemeAccentPreset>('violet');
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const [visible, setVisible] = useState(true);
  const [fallback, setFallback] = useState(true);
  const [selected, setSelected] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    if (trigger?.isConnected) trigger.focus();
    else if (fallback) fallbackRef.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        panel.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
      });
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [open]);
  return (
    <ThemeProvider mode={mode} accent={accent}>
      <main
        style={{
          padding: 24,
          color: 'var(--hn-color-text)',
          background: 'var(--hn-color-surface)',
        }}
      >
        <h1>跨端行为验收</h1>
        <output data-testid="count">{count}</output>
        <Button
          disabled={disabled}
          onClick={() => {
            setCount(count + 1);
          }}
        >
          B01 激活
        </Button>
        <Button
          onClick={() => {
            setDisabled(!disabled);
          }}
        >
          切换禁用
        </Button>
        <section data-testid="B02">
          {data.variants.map((v) =>
            data.sizes.map((s) => (
              <span key={`${v}-${s}`}>
                <Button variant={v as ButtonVariant} size={s as ButtonSize}>
                  {v}/{s}
                </Button>
                <Button ghost variant={v as ButtonVariant} size={s as ButtonSize}>
                  ghost {v}/{s}
                </Button>
              </span>
            )),
          )}
          <Button variant="ghost">旧 ghost</Button>
        </section>
        <section data-testid="I01">
          {ICON_NAMES.map((name) => (
            <Icon name={name} label={name} key={name} />
          ))}
          <Icon name="pen" />
        </section>
        <TextField
          label={data.label}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          hint={data.hint}
          {...(error ? { error: data.error } : {})}
          disabled={disabled}
        />
        <TextField
          label="非受控笔记"
          defaultValue={data.initialText}
          onChange={(e) => {
            setRaw(e.target.value);
          }}
        />
        <output data-testid="values">
          {value}/{raw}
        </output>
        <Button
          onClick={() => {
            setError(!error);
          }}
        >
          T02 切换错误
        </Button>
        <output data-testid="selection">{selected}</output>
        {visible ? (
          <button
            type="button"
            className="hn-button hn-button--secondary"
            ref={setTrigger}
            aria-expanded={open}
            onClick={() => {
              setOpen(true);
            }}
          >
            P01 打开菜单
          </button>
        ) : null}
        <button
          type="button"
          className="hn-button hn-button--secondary"
          ref={fallbackRef}
          onClick={() => {
            setVisible(true);
          }}
        >
          P04 后备目标
        </button>
        <Button
          onClick={() => {
            setFallback(!fallback);
          }}
        >
          切换后备
        </Button>
        {open ? (
          <>
            <button
              aria-label="遮罩关闭"
              onClick={close}
              style={{ position: 'fixed', inset: 0, opacity: 0, zIndex: 999 }}
            />
            <Popover
              anchor={trigger}
              placement="bottom-end"
              theme={mode}
              orientation="vertical"
              ref={panel}
              role="dialog"
              aria-label="操作菜单"
              style={{
                maxHeight: '65vh',
                overflowY: 'auto',
                width: 260,
                zIndex: 1000,
                position: 'fixed',
                ...(trigger === null ? { left: 16, top: 16 } : {}),
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  close();
                }
              }}
            >
              <Button onClick={close}>关闭</Button>
              <Menu aria-label="共享菜单">
                <MenuItem
                  onClick={() => {
                    setSelected(selected + 1);
                    close();
                  }}
                >
                  叶子选择
                </MenuItem>
                <MenuItem disabled>禁用项</MenuItem>
                <MenuSubmenu label="子菜单" panelTheme={mode}>
                  <MenuItem
                    onClick={() => {
                      setSelected(selected + 1);
                      close();
                    }}
                  >
                    子级叶子
                  </MenuItem>
                </MenuSubmenu>
              </Menu>
              <Button
                onClick={() => {
                  setVisible(false);
                }}
              >
                移除触发器
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                }}
              >
                卸载弹层
              </Button>
              <TextField label="P03 键盘" />
              {Array.from({ length: 25 }, (_, i) => (
                <p key={i}>可滚动内容 {i + 1}</p>
              ))}
            </Popover>
          </>
        ) : null}
        <section data-testid="H01">
          <Button
            onClick={() => {
              setMode(mode === 'dark' ? 'light' : 'dark');
            }}
          >
            切换明暗
          </Button>
          {data.accents.map((a) => (
            <Button
              key={a}
              onClick={() => {
                setAccent(a as ThemeAccentPreset);
              }}
            >
              {a}
            </Button>
          ))}
          <Button>外层</Button>
          <ThemeProvider mode="dark" accent="teal">
            <Button>内层</Button>
          </ThemeProvider>
        </section>
        <section data-testid="H02">
          <ThemeProvider
            accent="oklch(70% 0.2 40)"
            style={{ '--hn-radius-md': '18px' } as CSSProperties}
          >
            <Button>自定义子树</Button>
          </ThemeProvider>
          <Button>兄弟子树</Button>
        </section>
      </main>
    </ThemeProvider>
  );
}
