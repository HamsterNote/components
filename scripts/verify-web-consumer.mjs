import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const out = path.resolve('artifacts/web');
const baseline = path.join(out, 'hamster-note-components-0.3.0.tgz');
const candidate = path.join(out, 'hamster-note-components-0.3.1.tgz');
const content = (file, target) =>
  execFileSync('tar', ['-xOf', file, 'package/' + target], { maxBuffer: 20_000_000 });
const oldManifest = JSON.parse(content(baseline, 'package.json'));
const newManifest = JSON.parse(content(candidate, 'package.json'));
assert.deepEqual(newManifest.exports, oldManifest.exports);
assert.deepEqual(newManifest.peerDependencies, oldManifest.peerDependencies);
const mappings = [];
for (const [entry, mapping] of Object.entries(newManifest.exports)) {
  for (const target of typeof mapping === 'string' ? [mapping] : Object.values(mapping))
    assert.ok(content(candidate, target.replace(/^\.\//, '')).length);
  mappings.push({ entry, mapping });
}
const oldCss = content(baseline, 'dist/hamster-note-components.css');
const newCss = content(candidate, 'dist/hamster-note-components.css');
const consumer = mkdtempSync(path.join(tmpdir(), 'ham163-web-consumer-'));
writeFileSync(
  path.join(consumer, 'package.json'),
  JSON.stringify(
    {
      name: 'ham163-web-consumer',
      version: '1.0.0',
      private: true,
      type: 'module',
      dependencies: {
        '@hamster-note/components': 'file:' + candidate,
        react: '19.2.7',
        'react-dom': '19.2.7',
      },
      devDependencies: { '@types/react': '19.2.17', '@types/react-dom': '19.2.3' },
    },
    null,
    2,
  ),
);
execFileSync('npm', ['install', '--ignore-scripts'], { cwd: consumer, stdio: 'pipe' });
const entries = Object.keys(newManifest.exports).filter((e) => e !== './styles.css');
const imports = entries.map(
  (e, i) => `import * as Entry${i} from '@hamster-note/components${e === '.' ? '' : e.slice(1)}';`,
);
writeFileSync(
  path.join(consumer, 'main.ts'),
  imports.join('\n') +
    "\nimport '@hamster-note/components/styles.css';\n" +
    `console.log(${entries.map((_, i) => `Object.keys(Entry${i})`).join(', ')});`,
);
writeFileSync(
  path.join(consumer, 'index.html'),
  '<html><body><script type="module" src="/main.ts"></script></body></html>',
);
writeFileSync(
  path.join(consumer, 'tsconfig.json'),
  JSON.stringify({
    compilerOptions: {
      strict: true,
      noEmit: true,
      lib: ['ES2022', 'DOM'],
      skipLibCheck: true,
      module: 'ESNext',
      moduleResolution: 'Bundler',
      types: ['react', 'react-dom'],
    },
    include: ['main.ts', 'css.d.ts'],
  }),
);
writeFileSync(path.join(consumer, 'css.d.ts'), "declare module '*.css';\n");
execFileSync(
  process.execPath,
  [path.resolve('node_modules/typescript/bin/tsc'), '-p', path.join(consumer, 'tsconfig.json')],
  { cwd: consumer, stdio: 'pipe' },
);
const build = execFileSync(
  process.execPath,
  [path.resolve('node_modules/vite/bin/vite.js'), 'build'],
  { cwd: consumer, encoding: 'utf8' },
);
writeFileSync(path.join(out, 'consumer-build.txt'), build);
for (const f of ['package.json', 'package-lock.json', 'main.ts', 'tsconfig.json'])
  writeFileSync(path.join(out, 'consumer-' + f), readFileSync(path.join(consumer, f)));
writeFileSync(
  path.join(out, 'exports-comparison.json'),
  JSON.stringify(
    {
      baseline: oldManifest.version,
      candidate: newManifest.version,
      mappings,
      exportsIdentical: true,
      peersIdentical: true,
      cssByteIdentical: oldCss.equals(newCss),
      consumer,
      typecheck: 'passed',
      build: 'passed',
    },
    null,
    2,
  ),
);
console.log('Web exports, types and CSS consumption passed; CSS identical:', oldCss.equals(newCss));
