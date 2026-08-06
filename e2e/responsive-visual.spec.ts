import { expect, test } from '@playwright/test';

import { disableStickyDemoChrome, prepareVisualPage } from './visual-helpers';

const mobileComponentSections = [
  'buttons',
  'badges',
  'fields',
  'cards',
  'popovers',
  'menus',
  'kbds',
  'loadings',
  'icons',
  'dialogs',
  'drawers',
  'confirms',
  'themes',
] as const;

test.describe('浅色桌面视觉回归', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('Given 浅色主题工作台, When 截取首屏, Then 浅色令牌和组件排版不漂移', async ({ page }) => {
    await prepareVisualPage(page);
    await page.getByRole('button', { name: '切换到浅色主题' }).click();
    await expect(page.locator('.demo-page').locator('..')).toHaveAttribute('data-mode', 'light');

    await expect(page).toHaveScreenshot('light-desktop-workbench.png');
  });
});

test.describe('移动端视觉回归', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Given 移动端工作台, When 截取首屏, Then 响应式布局和中文排版不漂移', async ({ page }) => {
    await prepareVisualPage(page);

    await expect(page).toHaveScreenshot('mobile-workbench.png');
  });

  for (const sectionId of mobileComponentSections) {
    test(`Given 390px ${sectionId} 展示区, When 截取完整章节, Then 移动端组件布局不漂移`, async ({
      page,
    }) => {
      await prepareVisualPage(page);
      await disableStickyDemoChrome(page);

      const screenshotOptions = sectionId === 'icons' ? { maxDiffPixels: 20 } : undefined;
      await expect(page.locator(`#${sectionId}`)).toHaveScreenshot(
        `mobile-${sectionId}-section.png`,
        screenshotOptions,
      );
    });
  }

  test('Given 390px 普通 Dialog 已打开, When 截取视口, Then 移动端模态布局不漂移', async ({
    page,
  }) => {
    await prepareVisualPage(page);
    const section = page.locator('#dialogs');
    await section
      .getByText('Basic / 基础对话框')
      .locator('..')
      .locator('..')
      .getByRole('button', { name: '打开' })
      .click();

    await expect(page).toHaveScreenshot('mobile-dialog-default.png');
  });
});

test.describe('平板导航回归', () => {
  test.use({ viewport: { width: 1024, height: 900 } });

  test('Given 1024px 工作台, When 导航项超出可用宽度, Then 页面不产生水平溢出且导航可滚动', async ({
    page,
  }) => {
    await prepareVisualPage(page);

    const metrics = await page.locator('.topbar nav').evaluate((navigation) => ({
      clientWidth: navigation.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      scrollWidth: navigation.scrollWidth,
      viewportWidth: window.innerWidth,
    }));

    expect(metrics.documentWidth).toBe(metrics.viewportWidth);
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
    await expect(page.locator('.topbar')).toHaveScreenshot('tablet-navigation.png');
  });
});
