import { expect, test } from '@playwright/test';

import { disableStickyDemoChrome, prepareVisualPage } from './visual-helpers';

const componentSections = [
  ['buttons', 'Button'],
  ['badges', 'Badge'],
  ['fields', 'TextField'],
  ['cards', 'NoteCard'],
  ['popovers', 'Popover'],
  ['menus', 'Menu'],
  ['kbds', 'Kbd'],
  ['loadings', 'Loading'],
  ['icons', 'Icon'],
  ['dialogs', 'Dialog'],
  ['drawers', 'Drawer'],
  ['confirms', 'Confirm'],
  ['themes', 'ThemeProvider'],
] as const;

test.beforeEach(async ({ page }) => {
  await prepareVisualPage(page);
  await disableStickyDemoChrome(page);
});

for (const [sectionId, componentName] of componentSections) {
  test(`Given ${componentName} 展示区, When 截取完整章节, Then 默认样式矩阵不漂移`, async ({
    page,
  }) => {
    const screenshotOptions = sectionId === 'icons' ? { maxDiffPixels: 20 } : undefined;
    await expect(page.locator(`#${sectionId}`)).toHaveScreenshot(
      `${sectionId}-section.png`,
      screenshotOptions,
    );
  });
}

test('Given TextField 错误状态, When 截取完整章节, Then 校验样式和布局不漂移', async ({ page }) => {
  await page.getByRole('textbox', { name: '笔记标题' }).fill('季');

  await expect(page.locator('#fields')).toHaveScreenshot('fields-error-section.png');
});

test('Given 普通 Dialog 已打开, When 截取视口, Then 遮罩、面板与按钮样式不漂移', async ({
  page,
}) => {
  const section = page.locator('#dialogs');
  await section
    .getByText('Basic / 基础对话框')
    .locator('..')
    .locator('..')
    .getByRole('button', { name: '打开' })
    .click();
  await expect(page.getByRole('dialog', { name: '移动笔记' })).toBeVisible();

  await expect(page).toHaveScreenshot('dialog-default.png');
});

test('Given Menu 与子菜单已展开, When 分别截取两个菜单, Then 控件本身样式不受页面滚动影响', async ({
  page,
}) => {
  await page.locator('#menus').getByRole('button', { name: '整理', exact: true }).click();
  const submenuTrigger = page.getByRole('menuitem', { name: '移动到…' }).last();
  await submenuTrigger.hover();
  await expect(page.getByRole('menuitem', { name: '收件箱' }).last()).toBeVisible();
  const menus = page.getByRole('menu');

  await expect(menus.first()).toHaveScreenshot('menu-root.png', { maxDiffPixels: 20 });
  await expect(menus.last()).toHaveScreenshot('menu-submenu.png', { maxDiffPixels: 20 });
});
