import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
      include: ['src'],
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'comment-drawer': 'src/comment-drawer/index.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'hamster-note-components-pro',
    },
    rolldownOptions: {
      external: [
        '@hamster-note/components/button',
        '@hamster-note/components/confirm',
        '@hamster-note/components/drawer',
        '@hamster-note/components/icon',
        '@hamster-note/notes',
        'react',
        'react/jsx-runtime',
      ],
    },
  },
});
