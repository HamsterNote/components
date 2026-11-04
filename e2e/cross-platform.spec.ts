import { test, expect } from '@playwright/test';
import data from '../fixtures/cross-platform.json' with { type: 'json' };
test.beforeEach(async ({ page }) => {
  await page.goto('/?validation=1');
});
test('B01: activation exactly once and disabled guard', async ({ page }) => {
  await page.getByRole('button', { name: 'B01 激活', exact: true }).click();
  await expect(page.getByTestId('count')).toHaveText('1');
  await page.getByRole('button', { name: '切换禁用', exact: true }).click();
  await expect(page.getByRole('button', { name: 'B01 激活' })).toBeDisabled();
  await page.getByRole('button', { name: 'B01 激活' }).evaluate((el: HTMLButtonElement) => {
    el.click();
  });
  await expect(page.getByTestId('count')).toHaveText('1');
});
test('B02: six variants three sizes and ghost aliases', async ({ page }) => {
  await expect(page.getByTestId('B02').getByRole('button')).toHaveCount(37);
  for (const v of data.variants)
    for (const s of data.sizes)
      await expect(page.getByRole('button', { name: `${v}/${s}`, exact: true })).toHaveClass(
        new RegExp(`hn-button--${v}.*hn-button--${s}`),
      );
  await expect(page.getByRole('button', { name: '旧 ghost', exact: true })).toHaveClass(
    /hn-button--secondary hn-button--ghost/,
  );
});
test('I01: all named geometry and decorative semantics', async ({ page }) => {
  await expect(page.getByTestId('I01').getByRole('img')).toHaveCount(65);
  await expect(page.getByTestId('I01').locator('svg[aria-hidden="true"]')).toHaveCount(1);
});
test('T01 T02: Chinese persistence and error priority', async ({ page }) => {
  for (const label of [data.label, '非受控笔记']) {
    await page.getByRole('textbox', { name: label, exact: true }).fill(data.changedText);
    await page.getByRole('textbox', { name: label, exact: true }).blur();
    await expect(page.getByRole('textbox', { name: label, exact: true })).toHaveValue(
      data.changedText,
    );
  }
  await expect(page.getByTestId('values')).toHaveText(`${data.changedText}/${data.changedText}`);
  await page.getByRole('button', { name: 'T02 切换错误' }).click();
  await expect(
    page.getByRole('textbox', { name: data.label, exact: true }),
  ).toHaveAccessibleDescription(data.error);
  await expect(page.getByText(data.hint, { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '切换禁用', exact: true }).click();
  await expect(page.getByRole('textbox', { name: data.label, exact: true })).toBeDisabled();
});
test('P01 P02: focus, cancel, nested return and one leaf callback', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'P01 打开菜单' });
  await trigger.click();
  await expect(page.getByRole('menuitem', { name: '叶子选择', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  const sub = page.getByRole('menuitem', { name: '子菜单', exact: true });
  await sub.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('menuitem', { name: '子级叶子' })).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(sub).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.getByRole('menuitem', { name: '子级叶子' }).click();
  await expect(page.getByTestId('selection')).toHaveText('1');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await trigger.click();
  await expect(page.getByRole('menuitem', { name: '禁用项' })).toBeDisabled();
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('button', { name: '遮罩关闭' }).click({ position: { x: 2, y: 2 } });
  await expect(trigger).toBeFocused();
});
test('P03: resize and overflow remain reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 });
  await page.getByRole('button', { name: 'P01 打开菜单' }).click();
  for (const size of [
    { width: 390, height: 640 },
    { width: 640, height: 390 },
  ]) {
    await page.setViewportSize(size);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect
      .poll(async () => {
        const b = await dialog.boundingBox();
        return b
          ? b.x >= 0 && b.y >= 0 && b.x + b.width <= size.width && b.y + b.height <= size.height
          : false;
      })
      .toBe(true);
    await dialog.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(page.getByText('可滚动内容 25', { exact: true })).toBeInViewport();
  }
});
test('P04: removed trigger fallback and safe unmount', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.getByRole('button', { name: 'P01 打开菜单' }).click();
  await page.getByRole('button', { name: '移除触发器' }).click();
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await expect(page.getByRole('button', { name: 'P04 后备目标' })).toBeFocused();
  await page.getByRole('button', { name: 'P04 后备目标' }).click();
  await page.getByRole('button', { name: '切换后备' }).click();
  await page.getByRole('button', { name: 'P01 打开菜单' }).click();
  await page.getByRole('button', { name: '移除触发器' }).click();
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'P04 后备目标' }).click();
  await page.getByRole('button', { name: 'P01 打开菜单' }).click();
  await page.getByRole('button', { name: '卸载弹层' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('H01 H02: presets, nesting and local CSS tokens', async ({ page }) => {
  for (const mode of ['dark', 'light']) {
    for (const a of data.accents) {
      await page.getByRole('button', { name: a, exact: true }).click();
      await expect(page.locator('main').locator('..')).toHaveAttribute('data-accent', a);
      await expect(page.locator('main').locator('..')).toHaveAttribute('data-mode', mode);
      await expect(
        page.getByRole('button', { name: '内层', exact: true }).locator('..'),
      ).toHaveAttribute('data-mode', 'dark');
    }
    await page.getByRole('button', { name: '切换明暗' }).click();
  }
  await expect(page.getByRole('button', { name: '自定义子树' })).toHaveCSS('border-radius', '18px');
  await expect(page.getByRole('button', { name: '兄弟子树' })).toHaveCSS('border-radius', '8px');
});
