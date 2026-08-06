import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Given 组件工作台, When 首次打开, Then 展示全部公共组件章节', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('为笔记体验打造');
  await expect(page.locator('main > section')).toHaveCount(15);
  await expect(page.getByRole('navigation', { name: '组件导航' }).getByRole('link')).toHaveCount(
    14,
  );
  await expect(page.getByRole('status').first()).toContainText('等待交互');
});

test('Given Pro 评论区, When 发布评论并关闭, Then Drawer 展示新评论且反馈同步', async ({
  page,
}) => {
  await page.locator('#comments').getByRole('button', { name: '查看评论' }).click();
  const drawer = page.getByRole('dialog', { name: '研究摘要评论' });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveCSS('position', 'fixed');
  await expect(drawer).toHaveCSS('width', '400px');

  await drawer.getByRole('textbox', { name: '添加评论' }).fill('我来补充验证数据。');
  await drawer.getByRole('button', { name: '发布评论' }).click();

  await expect(drawer.getByText('我来补充验证数据。')).toBeVisible();
  await expect(page.getByRole('status').first()).toContainText('已发布评论：我来补充验证数据。');

  await drawer.getByRole('button', { name: '关闭抽屉' }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page.getByRole('status').first()).toContainText('已关闭 Pro 评论面板');
});

test('Given Pro 评论区已有评论, When 回复评论, Then 回复显示在原评论下且反馈同步', async ({
  page,
}) => {
  await page.locator('#comments').getByRole('button', { name: '查看评论' }).click();
  const drawer = page.getByRole('dialog', { name: '研究摘要评论' });

  const replyTrigger = drawer.getByRole('button', { name: '回复林晓的评论' });
  await replyTrigger.click();
  await drawer.getByRole('textbox', { name: '回复林晓' }).fill('摘要区已同步更新。');
  await drawer.getByRole('button', { name: '发布回复' }).click();

  await expect(drawer.getByText('摘要区已同步更新。')).toBeVisible();
  await expect(replyTrigger).toBeFocused();
  await expect(page.getByRole('status').first()).toContainText('已发布回复：摘要区已同步更新。');
});

test('Given 初始深色主题, When 切换主题, Then 根主题属性和按钮名称同步更新', async ({ page }) => {
  const rootTheme = page.locator('.demo-page').locator('..');
  await expect(rootTheme).toHaveAttribute('data-mode', 'dark');

  await page.getByRole('button', { name: '切换到浅色主题' }).click();

  await expect(rootTheme).toHaveAttribute('data-mode', 'light');
  await expect(page.getByRole('button', { name: '切换到深色主题' })).toContainText('Light');
});

test('Given Button 展示区, When 点击 Primary, Then 交互反馈精确更新', async ({ page }) => {
  await page.getByRole('button', { name: 'Primary', exact: true }).click();

  await expect(page.getByRole('status').first()).toContainText('Primary：已创建一条新笔记');
});

test('Given 笔记标题输入框, When 输入短标题再补足, Then 错误状态出现后消失', async ({ page }) => {
  const field = page.getByRole('textbox', { name: '笔记标题' });
  await field.fill('季');

  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('标题至少需要 3 个字符')).toBeVisible();

  await field.fill('季度规划');
  await expect(field).not.toHaveAttribute('aria-invalid');
  await expect(page.getByText('标题至少需要 3 个字符')).toHaveCount(0);
});

test('Given 两张笔记卡, When 选择研究摘要, Then pressed 状态与反馈同步切换', async ({ page }) => {
  const planning = page.getByRole('button', { name: '第三季度产品规划' });
  const research = page.getByRole('button', { name: '用户研究摘要' });
  await expect(planning).toHaveAttribute('aria-pressed', 'true');

  await research.click();

  await expect(planning).toHaveAttribute('aria-pressed', 'false');
  await expect(research).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status').first()).toContainText('已选择「用户研究摘要」');
});

test('Given 编辑菜单关闭, When 打开并选择复制, Then 菜单关闭且反馈更新', async ({ page }) => {
  const menuSection = page.locator('#menus');
  await menuSection.getByRole('button', { name: '编辑', exact: true }).click();
  const menu = page.getByRole('menu', { name: '编辑操作' });
  await expect(menu).toBeVisible();

  await menu.getByRole('menuitem', { name: '复制' }).click();

  await expect(menu).toHaveCount(0);
  await expect(page.getByRole('status').first()).toContainText('已复制');
});

test('Given 整理菜单, When 用键盘进入和退出子菜单, Then 焦点按 ARIA 模式移动', async ({ page }) => {
  const menuSection = page.locator('#menus');
  await menuSection.getByRole('button', { name: '整理', exact: true }).click();
  const trigger = page.getByRole('menuitem', { name: '移动到…' }).last();
  await trigger.focus();
  await trigger.press('ArrowRight');

  const inbox = page.getByRole('menuitem', { name: '收件箱' }).last();
  await expect(inbox).toBeFocused();
  await inbox.press('ArrowLeft');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('Given 编辑菜单已打开, When 按 Escape 或点击外部, Then 浮层按预期关闭', async ({ page }) => {
  const menuSection = page.locator('#menus');
  const opener = menuSection.getByRole('button', { name: '编辑', exact: true });
  await opener.click();
  await expect(page.getByRole('menu', { name: '编辑操作' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu', { name: '编辑操作' })).toHaveCount(0);

  await opener.click();
  await page.getByRole('heading', { level: 1 }).click();
  await expect(page.getByRole('menu', { name: '编辑操作' })).toHaveCount(0);
});
