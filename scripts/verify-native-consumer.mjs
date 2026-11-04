import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const out = path.resolve(process.argv[2] ?? 'artifacts/native');
mkdirSync(out, { recursive: true });
const consumer = mkdtempSync(path.join(tmpdir(), 'ham163-native-consumer-'));
const tarball = path.resolve('artifacts/native/hamster-note-components-native-0.1.0-beta.0.tgz');
const native = JSON.parse(readFileSync('packages/components-native/package.json', 'utf8'));
const versions = native.devDependencies;
copyFileSync(tarball, path.join(consumer, 'native.tgz'));
const manifest = {
  name: 'ham163-isolated-consumer',
  version: '1.0.0',
  private: true,
  type: 'module',
  dependencies: {
    '@hamster-note/components-native': 'file:./native.tgz',
    react: versions.react,
    'react-native': versions['react-native'],
    'react-native-svg': versions['react-native-svg'],
  },
};
writeFileSync(path.join(consumer, 'package.json'), JSON.stringify(manifest, null, 2));
const install = execFileSync(
  'npm',
  ['install', '--ignore-scripts', '--registry=https://registry.npmjs.org'],
  { cwd: consumer, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
);
writeFileSync(path.join(out, 'consumer-install.txt'), install);
const tree = execFileSync('npm', ['ls', '--all', '--json'], {
  cwd: consumer,
  encoding: 'utf8',
  maxBuffer: 20_000_000,
});
writeFileSync(path.join(out, 'consumer-tree.json'), tree);
copyFileSync(
  path.join(consumer, 'package-lock.json'),
  path.join(out, 'consumer-package-lock.json'),
);
copyFileSync(path.join(consumer, 'package.json'), path.join(out, 'consumer-package.json'));
const lock = JSON.parse(readFileSync(path.join(consumer, 'package-lock.json'), 'utf8'));
const forbidden = Object.keys(lock.packages).filter((p) =>
  /node_modules\/(react-dom|@hamster-note\/components)(?:\/|$)/.test(p),
);
if (forbidden.length) throw new Error('Forbidden packages: ' + forbidden.join(', '));
const entries = ['.', 'button', 'icon', 'popover', 'menu', 'text-field', 'theme'];
writeFileSync(
  path.join(consumer, 'entries.ts'),
  entries
    .map(
      (entry, i) =>
        `import * as Entry${i} from '@hamster-note/components-native${entry === '.' ? '' : '/' + entry}';\nvoid Entry${i};`,
    )
    .join('\n'),
);
writeFileSync(
  path.join(consumer, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        strict: true,
        noEmit: true,
        lib: ['ES2022'],
        types: ['react', 'react-native'],
        skipLibCheck: true,
        module: 'ESNext',
        moduleResolution: 'Bundler',
        target: 'ES2022',
        jsx: 'react-jsx',
      },
      include: ['entries.ts'],
    },
    null,
    2,
  ),
);
// The compiler binary is a tool; module resolution starts at the isolated project.
execFileSync(
  'npm',
  [
    'install',
    '--save-dev',
    '@types/react@' + versions['@types/react'],
    '--ignore-scripts',
    '--registry=https://registry.npmjs.org',
  ],
  { cwd: consumer, stdio: 'pipe' },
);
const tsc = path.resolve('packages/components-native/node_modules/typescript/bin/tsc');
execFileSync(process.execPath, [tsc, '--project', path.join(consumer, 'tsconfig.json')], {
  cwd: consumer,
  stdio: 'pipe',
});
for (const f of ['entries.ts', 'tsconfig.json'])
  copyFileSync(path.join(consumer, f), path.join(out, 'consumer-' + f));
writeFileSync(
  path.join(out, 'consumer-result.json'),
  JSON.stringify(
    {
      consumer,
      tarball,
      packageCount: Object.keys(lock.packages).length - 1,
      forbidden,
      typecheck: 'passed',
      entries,
      lib: ['ES2022'],
      versions: Object.fromEntries(
        ['react', 'react-native', 'react-native-svg'].map((name) => [name, versions[name]]),
      ),
    },
    null,
    2,
  ),
);
console.log(
  'Isolated consumer installation, full tree and seven entry typecheck passed:',
  consumer,
);
