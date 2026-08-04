import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Given 基础对话框, When 打开、全屏并关闭, Then 模态状态完整闭环', async ({ page }) => {
  const dialogSection = page.locator('#dialogs');
  await dialogSection
    .getByText('Basic / 基础对话框')
    .locator('..')
    .locator('..')
    .getByRole('button', { name: '打开' })
    .click();
  const dialog = page.getByRole('dialog', { name: '移动笔记' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

  await page.getByRole('button', { name: '全屏显示' }).click();
  await expect(dialog).toHaveClass(/hn-dialog__panel--fullscreen/);
  await page.getByRole('button', { name: '关闭对话框' }).click();

  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('status').first()).toContainText('已关闭对话框（基础示例）');
});

test('Given 关闭策略禁用, When 按 Escape, Then 对话框保持打开', async ({ page }) => {
  const section = page.locator('#dialogs');
  await section.getByLabel('closeOnEsc').uncheck();
  await section.getByRole('button', { name: '打开（用上述开关）' }).click();
  const dialog = page.getByRole('dialog', { name: '移动笔记' });

  await page.keyboard.press('Escape');

  await expect(dialog).toBeVisible();
  await page.getByRole('button', { name: '关闭对话框' }).click();
});

test('Given 基础对话框打开, When 键盘遍历并按 Escape, Then 焦点循环且关闭后回到触发器', async ({
  page,
}) => {
  const section = page.locator('#dialogs');
  const opener = section
    .getByText('Basic / 基础对话框')
    .locator('..')
    .locator('..')
    .getByRole('button', { name: '打开' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: '移动笔记' });
  const firstAction = dialog.getByRole('button', { name: '全屏显示' });
  const lastAction = dialog.getByRole('button', { name: '移动' });
  await expect(firstAction).toBeFocused();

  await firstAction.press('Shift+Tab');
  await expect(lastAction).toBeFocused();
  await lastAction.press('Tab');
  await expect(firstAction).toBeFocused();
  await page.keyboard.press('Escape');

  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('Given 背景关闭策略, When 点击遮罩, Then 启用时关闭而禁用时保持打开', async ({ page }) => {
  const section = page.locator('#dialogs');
  const policyOpener = section.getByRole('button', { name: '打开（用上述开关）' });
  await policyOpener.click();
  let dialog = page.getByRole('dialog', { name: '移动笔记' });
  await page.locator('.hn-dialog__backdrop').dispatchEvent('pointerdown');
  await expect(dialog).toHaveCount(0);

  await section.getByLabel('closeOnBackdrop').uncheck();
  await policyOpener.click();
  dialog = page.getByRole('dialog', { name: '移动笔记' });
  await page.locator('.hn-dialog__backdrop').dispatchEvent('pointerdown');

  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '关闭对话框' }).click();
});

test('Given 自定义尺寸抽屉, When 打开并全屏, Then 尺寸变量与全屏状态正确', async ({ page }) => {
  await page.locator('#drawers').getByRole('button', { name: '右侧 520' }).click();
  const drawer = page.getByRole('dialog', { name: '抽屉标题' });
  await expect(drawer).toHaveClass(/hn-drawer__panel--right/);
  await expect(drawer).toHaveCSS('--hn-drawer-size', '520px');

  await page.getByRole('button', { name: '全屏显示抽屉' }).click();
  await expect(drawer).toHaveClass(/hn-drawer__panel--fullscreen/);
  await drawer.getByLabel('关闭抽屉', { exact: true }).click();
  await expect(drawer).toHaveCount(0);
});

test('Given danger 确认示例, When 确认删除, Then 对话框关闭且反馈精确更新', async ({ page }) => {
  await page.locator('#confirms').getByRole('button', { name: '删除（danger）' }).click();
  const dialog = page.getByRole('dialog', { name: '删除笔记？' });
  const deleteButton = dialog.getByRole('button', { name: '删除' });
  await expect(deleteButton).toHaveClass(/hn-button--danger/);

  await deleteButton.click();

  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('status').first()).toContainText('组件模式：已删除');
});

test('Given hook 确认示例, When 用户取消, Then Promise 结果反馈为已取消', async ({ page }) => {
  await page.locator('#confirms').getByRole('button', { name: '保存（hook）' }).click();
  const dialog = page.getByRole('dialog', { name: '保存修改？' });
  await dialog.getByRole('button', { name: '取消' }).click();

  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('status').first()).toContainText('hook 模式：已取消');
});

test('Given 纯函数确认示例, When 用户确认发布, Then Promise 结果反馈且命令式容器清理', async ({
  page,
}) => {
  await page.locator('#confirms').getByRole('button', { name: '发布（纯函数）' }).click();
  const dialog = page.getByRole('dialog', { name: '发布笔记？' });
  await dialog.getByRole('button', { name: '发布' }).click();

  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('status').first()).toContainText('纯函数模式：已发布');
});

test('Given 全屏 Loading 示例, When 启动, Then 单例遮罩出现并自动清理', async ({ page }) => {
  await page.locator('#loadings').getByRole('button', { name: '触发全屏' }).click();
  const overlay = page.locator('.hn-loading-overlay');

  await expect(overlay).toBeVisible();
  await expect(page.locator('.hn-loading-overlay')).toHaveCount(1);
  await expect(overlay).toHaveCount(0, { timeout: 3_000 });
});
