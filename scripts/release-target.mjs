import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
export function releaseTarget(tag, manifest, target = 'native') {
  const native = target === 'native';
  const prefix = native ? 'native-v' : 'v';
  const name = native ? '@hamster-note/components-native' : '@hamster-note/components';
  const version = tag.startsWith(prefix) ? tag.slice(prefix.length) : '';
  if (!/^\d+\.\d+\.\d+(?:-beta\.\d+)?$/.test(version)) throw new Error('Unsupported release tag');
  if (manifest.name !== name || manifest.version !== version || manifest.private)
    throw new Error('Tag / package identity / manifest version mismatch');
  return {
    directory: native ? 'packages/components-native' : '.',
    name,
    version,
    distTag: version.includes('-') ? 'beta' : 'latest',
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const manifest = JSON.parse(readFileSync('packages/components-native/package.json', 'utf8'));
  const result = releaseTarget(process.argv[2] ?? '', manifest);
  console.log(JSON.stringify(result));
  if (process.env.GITHUB_ENV) {
    const { appendFileSync } = await import('node:fs');
    appendFileSync(process.env.GITHUB_ENV, `PUBLISH_TAG=${result.distTag}\n`);
  }
}
