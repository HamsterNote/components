import { fileURLToPath } from 'node:url';
import { defineConfig, type Options } from 'tsup';
const common: Options = {
  entry: ['src/{index,button,icon,popover,menu,text-field,theme}.tsx'],
  format: ['esm'],
  dts: true,
  splitting: true,
  clean: true,
  external: ['react', 'react-native', 'react-native-svg'],
  target: 'es2022',
};
export default defineConfig([
  common,
  {
    ...common,
    outDir: 'dist-web',
    dts: false,
    esbuildPlugins: [
      {
        name: 'web-svg-primitives',
        setup(build) {
          build.onResolve({ filter: /^\.\/svg-elements$/ }, () => ({
            path: fileURLToPath(new URL('./src/svg-elements.web.ts', import.meta.url)),
          }));
        },
      },
    ],
  },
]);
