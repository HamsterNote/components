import { expect, test } from '@playwright/test';

import { prepareVisualPage } from './visual-helpers';

test.use({ viewport: { width: 1440, height: 1000 } });

test.beforeEach(async ({ page }) => {
  await prepareVisualPage(page);
});

test('Given 桌面工作台, When 截取首屏, Then 核心排版和基础组件视觉不漂移', async ({ page }) => {
  await expect(page).toHaveScreenshot('desktop-workbench.png');
});

test('Given 对话框打开并全屏, When 截取视口, Then 模态层视觉不漂移', async ({ page }) => {
  const section = page.locator('#dialogs');
  await section
    .getByText('Basic / 基础对话框')
    .locator('..')
    .locator('..')
    .getByRole('button', { name: '打开' })
    .click();
  await page.getByRole('button', { name: '全屏显示' }).click();

  await expect(page).toHaveScreenshot('fullscreen-dialog.png');
});

test('Given 菜单与子菜单展开, When 截取菜单区域, Then 浮层层级和样式不漂移', async ({ page }) => {
  const section = page.locator('#menus');
  await section.getByRole('button', { name: '整理', exact: true }).click();
  const submenu = page.getByRole('menuitem', { name: '移动到…' }).last();
  await submenu.hover();
  await expect(page.getByRole('menuitem', { name: '收件箱' }).last()).toBeVisible();

  await expect(page).toHaveScreenshot('nested-menu.png');
});
