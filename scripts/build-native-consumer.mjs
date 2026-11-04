import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const tool = createRequire(path.resolve('examples/native/package.json'));
const { getDefaultConfig } = tool('expo/metro-config');
const out = path.resolve('artifacts/native');
const { consumer } = JSON.parse(readFileSync(path.join(out, 'consumer-result.json'), 'utf8'));
const nativeRequire = createRequire(path.join(consumer, 'package.json'));
const Metro = nativeRequire('metro');
const entries = ['.', 'button', 'icon', 'popover', 'menu', 'text-field', 'theme'];
writeFileSync(
  path.join(consumer, 'entries.js'),
  entries
    .map(
      (e, i) =>
        `import * as Entry${i} from '@hamster-note/components-native${e === '.' ? '' : '/' + e}';`,
    )
    .join('\n') + `\nconsole.log(${entries.map((_, i) => `Object.keys(Entry${i})`).join(', ')});\n`,
);
const results = [];
for (const platform of ['ios', 'android']) {
  const config = getDefaultConfig(consumer);
  config.maxWorkers = 2;
  config.watchFolders = [consumer];
  config.resolver.nodeModulesPaths = [path.join(consumer, 'node_modules')];
  // Keep worker and serializer paired with the consumer's Metro. SDK 57's Expo
  // worker emits packed maps that require its own Server installation hooks.
  config.transformerPath = nativeRequire.resolve('metro-transform-worker');
  config.serializer.customSerializer = undefined;
  config.serializer.getModulesRunBeforeMainModule = () => [];
  config.serializer.getPolyfills = () =>
    ['console', 'error-guard'].map((n) =>
      nativeRequire.resolve('@react-native/js-polyfills/' + n + '.js'),
    );
  const result = await Metro.runBuild(config, {
    entry: 'entries.js',
    platform,
    dev: false,
    minify: false,
    out: path.join(out, `consumer-${platform}.js`),
    sourceMap: true,
  });
  results.push({
    platform,
    codeBytes: result.code.length,
    entries,
    projectRoot: consumer,
    result: 'passed',
  });
}
writeFileSync(path.join(out, 'consumer-bundles.json'), JSON.stringify(results, null, 2));
console.log('External native consumer: seven entry iOS/Android builds passed');
