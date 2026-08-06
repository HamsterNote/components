import { expect, type Page } from '@playwright/test';

export async function prepareVisualPage(page: Page): Promise<void> {
  await page.goto('/');

  // CI 与本地视觉基线都使用已安装的系统字体，避免远程字体晚到造成截图重排。
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

export async function disableStickyDemoChrome(page: Page): Promise<void> {
  // 元素截图应完整锁定章节本身，不能让滚动后的 sticky 顶栏覆盖被测像素。
  await page.addStyleTag({
    content: `
      .topbar {
        position: static !important;
        visibility: hidden !important;
      }
      html { scroll-behavior: auto !important; }
    `,
  });

  const topbar = page.locator('.topbar');
  await expect(topbar).toHaveCSS('position', 'static');
  await expect(topbar).toHaveCSS('visibility', 'hidden');
}
