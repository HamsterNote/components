import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    clearMocks: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      exclude: ['src/demo/**', 'src/**/*.d.ts', 'src/**/index.ts'],
      include: ['src/components/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        branches: 50,
        functions: 65,
        lines: 60,
        statements: 60,
      },
    },
  },
});
