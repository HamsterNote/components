import { expect, type Locator, type Page, test } from '@playwright/test';

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
] as const;

type Placement = (typeof PLACEMENTS)[number];
type Side = 'top' | 'bottom' | 'left' | 'right';
type Align = 'start' | 'center' | 'end';

interface ViewportCase {
  readonly name: string;
  readonly width: number;
  readonly height: number;
}

const VIEWPORTS: readonly ViewportCase[] = [
  { name: '桌面视口', width: 1280, height: 900 },
  { name: '600px 窄视口', width: 600, height: 740 },
];

const sideOf = (placement: Placement): Side => {
  if (placement.startsWith('top')) return 'top';
  if (placement.startsWith('bottom')) return 'bottom';
  if (placement.startsWith('left')) return 'left';
  return 'right';
};

const alignOf = (placement: Placement): Align => {
  if (placement.endsWith('-start')) return 'start';
  if (placement.endsWith('-end')) return 'end';
  return 'center';
};

async function positionAnchor(anchor: Locator, left: number, top: number): Promise<void> {
  await anchor.evaluate(
    (element, position) => {
      Object.assign(element.style, {
        position: 'fixed',
        left: `${String(position.left)}px`,
        top: `${String(position.top)}px`,
        width: '80px',
        height: '40px',
        zIndex: '1200',
      });
    },
    { left, top },
  );
}

async function openPlacementMenu(page: Page, placement: Placement): Promise<Locator> {
  await page.getByRole('combobox', { name: '一级菜单方向' }).selectOption(placement);
  const anchor = page.getByTestId('menu-placement-anchor');
  await anchor.click();
  const panel = page.getByTestId('menu-placement-panel');
  await expect(panel).toBeVisible();
  return panel;
}

async function closePlacementMenu(page: Page): Promise<void> {
  await page.getByTestId('menu-placement-anchor').click();
  await expect(page.getByTestId('menu-placement-panel')).toHaveCount(0);
}

function expectClose(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('menu-placement-demo').scrollIntoViewIfNeeded();
});

for (const viewport of VIEWPORTS) {
  test(`Given ${viewport.name}, When 逐一选择 12 方位, Then 基础主方向与物理对齐正确`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const anchor = page.getByTestId('menu-placement-anchor');
    await positionAnchor(anchor, viewport.width / 2 - 40, viewport.height / 2 - 20);

    for (const placement of PLACEMENTS) {
      const panel = await openPlacementMenu(page, placement);
      const anchorBox = await anchor.boundingBox();
      const panelBox = await panel.boundingBox();
      expect(anchorBox).not.toBeNull();
      expect(panelBox).not.toBeNull();
      if (anchorBox === null || panelBox === null) return;

      switch (sideOf(placement)) {
        case 'top':
          expectClose(panelBox.y + panelBox.height, anchorBox.y - 6);
          break;
        case 'bottom':
          expectClose(panelBox.y, anchorBox.y + anchorBox.height + 6);
          break;
        case 'left':
          expectClose(panelBox.x + panelBox.width, anchorBox.x - 6);
          break;
        case 'right':
          expectClose(panelBox.x, anchorBox.x + anchorBox.width + 6);
          break;
      }

      const align = alignOf(placement);
      if (sideOf(placement) === 'top' || sideOf(placement) === 'bottom') {
        const expectedX =
          align === 'start'
            ? anchorBox.x
            : align === 'end'
              ? anchorBox.x + anchorBox.width - panelBox.width
              : anchorBox.x + (anchorBox.width - panelBox.width) / 2;
        expectClose(panelBox.x, expectedX);
      } else {
        const expectedY =
          align === 'start'
            ? anchorBox.y
            : align === 'end'
              ? anchorBox.y + anchorBox.height - panelBox.height
              : anchorBox.y + (anchorBox.height - panelBox.height) / 2;
        expectClose(panelBox.y, expectedY);
      }
      await closePlacementMenu(page);
    }
  });

  test(`Given ${viewport.name}边缘锚点, When 逐一选择 12 方位, Then 主轴自动翻转且保留对齐`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const anchor = page.getByTestId('menu-placement-anchor');

    for (const placement of PLACEMENTS) {
      const side = sideOf(placement);
      const left =
        side === 'left' ? 2 : side === 'right' ? viewport.width - 82 : viewport.width / 2 - 40;
      const top =
        side === 'top' ? 2 : side === 'bottom' ? viewport.height - 42 : viewport.height / 2 - 20;
      await positionAnchor(anchor, left, top);
      const panel = await openPlacementMenu(page, placement);
      const anchorBox = await anchor.boundingBox();
      const panelBox = await panel.boundingBox();
      expect(anchorBox).not.toBeNull();
      expect(panelBox).not.toBeNull();
      if (anchorBox === null || panelBox === null) return;

      switch (side) {
        case 'top':
          expectClose(panelBox.y, anchorBox.y + anchorBox.height + 6);
          break;
        case 'bottom':
          expectClose(panelBox.y + panelBox.height, anchorBox.y - 6);
          break;
        case 'left':
          expectClose(panelBox.x, anchorBox.x + anchorBox.width + 6);
          break;
        case 'right':
          expectClose(panelBox.x + panelBox.width, anchorBox.x - 6);
          break;
      }
      await closePlacementMenu(page);
    }
  });

  test(`Given ${viewport.name}交叉轴越界, When 逐一选择 12 方位, Then 最终 clamp 到 8px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const anchor = page.getByTestId('menu-placement-anchor');

    for (const placement of PLACEMENTS) {
      const side = sideOf(placement);
      const vertical = side === 'top' || side === 'bottom';
      await positionAnchor(
        anchor,
        vertical ? 0 : viewport.width / 2 - 40,
        vertical ? viewport.height / 2 - 20 : 0,
      );
      const panel = await openPlacementMenu(page, placement);
      const panelBox = await panel.boundingBox();
      expect(panelBox).not.toBeNull();
      if (panelBox === null) return;
      expectClose(vertical ? panelBox.x : panelBox.y, 8);
      await closePlacementMenu(page);
    }
  });
}

test('Given 两层子菜单均已展开, When 在最深层按左箭头, Then 只返回直接父级', async ({ page }) => {
  const anchor = page.getByTestId('menu-placement-anchor');
  await anchor.click();
  const inheritedTrigger = page.getByRole('menuitem', { name: '继承子菜单默认方向' });
  await inheritedTrigger.focus();
  await inheritedTrigger.press('ArrowRight');

  const nestedTrigger = page.getByRole('menuitem', { name: '更深一层' });
  await nestedTrigger.focus();
  await nestedTrigger.press('ArrowRight');
  const nestedItem = page.getByRole('menuitem', { name: '深层项' });
  await expect(nestedItem).toBeFocused();

  await nestedItem.press('ArrowLeft');

  await expect(nestedItem).toHaveCount(0);
  await expect(nestedTrigger).toBeFocused();
  await expect(nestedTrigger).toHaveAttribute('aria-expanded', 'false');
  await expect(inheritedTrigger).toHaveAttribute('aria-expanded', 'true');
});

test('Given 两层子菜单均已展开, When 逐层按 Escape, Then 先逐层返回再关闭根菜单', async ({
  page,
}) => {
  const anchor = page.getByTestId('menu-placement-anchor');
  await anchor.click();
  const inheritedTrigger = page.getByRole('menuitem', { name: '继承子菜单默认方向' });
  await inheritedTrigger.focus();
  await inheritedTrigger.press('ArrowRight');

  const nestedTrigger = page.getByRole('menuitem', { name: '更深一层' });
  await nestedTrigger.focus();
  await nestedTrigger.press('ArrowRight');
  const nestedItem = page.getByRole('menuitem', { name: '深层项' });
  await expect(nestedItem).toBeFocused();

  await nestedItem.press('Escape');
  await expect(nestedItem).toHaveCount(0);
  await expect(nestedTrigger).toBeFocused();
  await expect(inheritedTrigger).toHaveAttribute('aria-expanded', 'true');

  await nestedTrigger.press('Escape');
  await expect(nestedTrigger).toHaveCount(0);
  await expect(inheritedTrigger).toBeFocused();

  await inheritedTrigger.press('Escape');
  await expect(page.getByTestId('menu-placement-panel')).toHaveCount(0);
  await expect(anchor).toBeFocused();
  await expect(anchor).toHaveAttribute('aria-expanded', 'false');
});
