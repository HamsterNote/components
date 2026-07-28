import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages 部署在 /components/ 子路径下，构建与预览需要对应的 base；
  // 开发服务器保持根路径，避免影响日常开发与 e2e。
  base: command === 'build' || isPreview ? '/components/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 9810,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 9810,
    strictPort: true,
  },
  build: {
    outDir: 'demo-dist',
  },
}));
