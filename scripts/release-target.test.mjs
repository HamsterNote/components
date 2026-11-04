import { test } from 'node:test';
import assert from 'node:assert/strict';
import { releaseTarget } from './release-target.mjs';
const native = { name: '@hamster-note/components-native', version: '0.1.0-beta.0' };
test('beta only routes native package to beta', () =>
  assert.deepEqual(releaseTarget('native-v0.1.0-beta.0', native), {
    directory: 'packages/components-native',
    name: native.name,
    version: native.version,
    distTag: 'beta',
  }));
test('stable routes native package to latest', () =>
  assert.equal(releaseTarget('native-v0.1.0', { ...native, version: '0.1.0' }).distTag, 'latest'));
for (const tag of ['v0.1.0-beta.0', 'native-v0.1.1', 'native-v0.1.0-rc.0', 'native-v0.1.0-beta.0x'])
  test(`reject ${tag}`, () => assert.throws(() => releaseTarget(tag, native)));
test('reject wrong package identity', () =>
  assert.throws(() =>
    releaseTarget('native-v0.1.0-beta.0', { ...native, name: '@hamster-note/components' }),
  ));
test('reject native tag on Web route', () =>
  assert.throws(() => releaseTarget('native-v0.1.0-beta.0', native, 'web')));
test('Web version keeps independent identity', () =>
  assert.equal(
    releaseTarget('v0.3.0', { name: '@hamster-note/components', version: '0.3.0' }, 'web')
      .directory,
    '.',
  ));
