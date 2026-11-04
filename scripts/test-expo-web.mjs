import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

const url = process.argv[2] ?? 'http://127.0.0.1:5292';
const out = path.resolve('artifacts/native/expo-web-browser');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const result = { url, checks: [], errors: [], responses500: [], result: 'failed' };
page.on('pageerror', (error) => result.errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') result.errors.push(message.text());
});
page.on('response', (response) => {
  if (response.status() >= 500) result.responses500.push(response.url());
});
const check = async (name, fn) => {
  await fn();
  result.checks.push(name);
  console.log('passed:', name);
};
try {
  await page.goto(url, { waitUntil: 'load', timeout: 90_000 });
  await page.getByRole('button', { name: 'B01 激活', exact: true }).waitFor({ timeout: 90_000 });
  await check(
    'buttons and controlled Chinese input render from the installed browser entry',
    async () => {
      await page.getByRole('button', { name: 'B01 激活', exact: true }).click();
      await expect(page.getByText(/B01 count=1;/)).toBeVisible();
      const input = page.getByRole('textbox', { name: '笔记名称', exact: true });
      await input.fill('验收输入中文abc');
      await input.blur();
      await expect(input).toHaveValue('验收输入中文abc');
    },
  );
  const trigger = page.getByRole('button', { name: 'P01 打开菜单', exact: true });
  await check(
    'menu opens, focuses its first item, navigates submenu and selects once',
    async () => {
      await trigger.click();
      await expect(page.getByRole('menuitem', { name: '叶子选择', exact: true })).toBeFocused();
      await page.screenshot({ path: path.join(out, 'menu.png') });
      await page.getByRole('menuitem', { name: '子菜单', exact: true }).click();
      await expect(page.getByRole('menuitem', { name: '孙菜单', exact: true })).toBeFocused();
      await page.getByRole('button', { name: '返回上一级', exact: true }).click();
      await expect(page.getByRole('menuitem', { name: '子菜单', exact: true })).toBeFocused();
      await page.getByRole('menuitem', { name: '子菜单', exact: true }).click();
      await page.getByRole('menuitem', { name: '子级叶子', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await expect(page.getByText(/P02 selected=1;/)).toBeVisible();
    },
  );
  await check('visible menu close returns browser focus to the mounted trigger', async () => {
    await trigger.click();
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
  await check(
    'Popover opens without native-only APIs and removed trigger restores fallback',
    async () => {
      await page.getByRole('button', { name: 'P03 超高弹层', exact: true }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'P01–P04 操作菜单', exact: true }),
      ).toBeFocused();
      await expect(page.getByRole('textbox', { name: 'P03 键盘', exact: true })).toBeVisible();
      await page.screenshot({ path: path.join(out, 'popover.png') });
      await page.getByRole('button', { name: 'P04 移除触发器', exact: true }).click();
      await page.getByRole('button', { name: '关闭', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'P04 重置 / 后备目标', exact: true }),
      ).toBeFocused();
    },
  );
  await expect(page.locator('svg')).toHaveCount(66);
  expect(result.errors).toEqual([]);
  expect(result.responses500).toEqual([]);
  result.result = 'passed';
} catch (error) {
  result.failure = String(error);
  await page.screenshot({ path: path.join(out, 'failure.png') }).catch((screenshotError) => {
    result.screenshotFailure = String(screenshotError);
  });
  throw error;
} finally {
  writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2) + '\n');
  await browser.close();
}
