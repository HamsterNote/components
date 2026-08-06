import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@hamster-note/components/button': fileURLToPath(
        new URL('../components/src/components/button/index.ts', import.meta.url),
      ),
      '@hamster-note/components/confirm': fileURLToPath(
        new URL('../components/src/components/confirm/index.ts', import.meta.url),
      ),
      '@hamster-note/components/drawer': fileURLToPath(
        new URL('../components/src/components/drawer/index.ts', import.meta.url),
      ),
      '@hamster-note/components/icon': fileURLToPath(
        new URL('../components/src/components/icon/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    clearMocks: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    server: {
      deps: {
        // multi-drag 目前发布了 Node 无法直接处理的 ESM 目录导入，交给 Vite 解析。
        inline: ['@hamster-note/notes', '@system-ui-js/multi-drag'],
      },
    },
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      exclude: ['src/**/*.d.ts', 'src/**/index.ts'],
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
});
