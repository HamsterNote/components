import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/{index,button,icon,popover,menu,text-field,theme}.tsx'],
  format: ['esm'],
  dts: true,
  splitting: true,
  clean: true,
  external: ['react', 'react-native', 'react-native-svg'],
  target: 'es2022',
});
