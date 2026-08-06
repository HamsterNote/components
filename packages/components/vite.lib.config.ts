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
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        button: 'src/components/button/index.ts',
        badge: 'src/components/badge/index.ts',
        confirm: 'src/components/confirm/index.ts',
        dialog: 'src/components/dialog/index.ts',
        drawer: 'src/components/drawer/index.ts',
        icon: 'src/components/icon/index.ts',
        kbd: 'src/components/kbd/index.ts',
        loading: 'src/components/loading/index.ts',
        menu: 'src/components/menu/index.ts',
        'note-card': 'src/components/note-card/index.ts',
        popover: 'src/components/popover/index.ts',
        'text-field': 'src/components/text-field/index.ts',
        theme: 'src/components/theme/index.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'hamster-note-components',
    },
    rolldownOptions: {
      external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
    },
  },
});
