import { defineConfig, devices } from '@playwright/test';

const { CI } = process.env;
const isCI = Boolean(CI);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  failOnFlakyTests: isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: isCI ? 'github' : [['list'], ['html', { open: 'never' }]],
  expect: {
    timeout: 8_000,
    toHaveScreenshot: {
      animations: 'disabled',
      // 小于一个普通按钮的像素面积，避免“小控件完全消失但整页比例仍通过”。
      maxDiffPixels: 200,
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:9810',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn build:demo && yarn preview',
    url: 'http://127.0.0.1:9810',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
