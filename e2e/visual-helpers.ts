import { expect, type Page } from '@playwright/test';

const visualFontQueries = ['16px "IBM Plex Sans"', '16px "IBM Plex Mono"'] as const;

export async function prepareVisualPage(page: Page): Promise<void> {
  await page.goto('/');

  // 视觉基线必须使用设计指定字体；远程字体失败时直接失败，避免误收 fallback 基线。
  const loadedFonts = await page.evaluate(async (fontQueries) => {
    await document.fonts.ready;
    return Promise.all(
      fontQueries.map(async (fontQuery) => (await document.fonts.load(fontQuery)).length > 0),
    );
  }, visualFontQueries);
  expect(loadedFonts).toEqual(visualFontQueries.map(() => true));
}

export async function disableStickyDemoChrome(page: Page): Promise<void> {
  // 元素截图应完整锁定章节本身，不能让滚动后的 sticky 顶栏覆盖被测像素。
  await page.addStyleTag({
    content: `
      .topbar { position: static !important; }
      html { scroll-behavior: auto !important; }
    `,
  });
}
