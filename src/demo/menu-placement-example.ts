export const placementExampleCode = `import {
  useEffect,
  useState,
} from 'react';
import {
  Button,
  Menu,
  MenuItem,
  MenuSubmenu,
} from '@hamster-note/components';

export function Example() {
  const [anchor, setAnchor] =
    useState<
      HTMLButtonElement | null
    >(null);

  useEffect(() => {
    if (!anchor) return;

    const close = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key !== 'Escape' ||
        event.defaultPrevented
      ) return;

      setAnchor(null);
      anchor.focus();
    };

    document.addEventListener(
      'keydown',
      close,
    );
    return () =>
      document.removeEventListener(
        'keydown',
        close,
      );
  }, [anchor]);

  return <>
  <Button
    aria-controls="example-menu"
    aria-expanded={!!anchor}
    aria-haspopup="menu"
    onClick={(event) =>
      setAnchor(
        anchor
          ? null
          : event.currentTarget,
      )
    }
  >
    打开菜单
  </Button>
  {anchor ? (
    <Menu
      anchor={anchor}
      aria-label="方位设置示例"
      id="example-menu"
      placement="bottom-start"
      submenuPlacement="right-start"
      submenuOffset={2}
      submenuViewportMargin={8}
    >
      <MenuSubmenu
        label="继承默认方向"
      >
        <MenuItem>
          继承树级方向
        </MenuItem>
      </MenuSubmenu>
      <MenuSubmenu
        label="当前层覆盖"
        placement="bottom-end"
      >
        <MenuItem>
          使用当前层方向
        </MenuItem>
      </MenuSubmenu>
    </Menu>
  ) : null}
  </>;
}`;
