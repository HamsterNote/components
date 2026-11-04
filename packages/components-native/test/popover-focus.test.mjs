import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';
import { afterEach, test } from 'node:test';

// Repository dev tools only. Render the actual native sources with real React hooks;
// RN hosts/events and RAF are controlled, not an iOS/Android accessibility verdict.
const tooling = createRequire(new URL('../../../package.json', import.meta.url));
const React = tooling('react');
const { JSDOM } = tooling('jsdom');
const ts = tooling('typescript');
const dom = new JSDOM('<body></body>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = tooling('react-dom/client');
let dispose;
afterEach(() => {
  dispose?.();
  dispose = undefined;
});

function harness(platform = 'android') {
  const frames = new Map();
  const focus = [];
  const inputFocus = [];
  let nextFrame = 0;
  let modal;
  let layout;
  const previousRaf = globalThis.requestAnimationFrame;
  const previousCancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  };
  globalThis.cancelAnimationFrame = (id) => frames.delete(id);

  const Host = React.forwardRef(function NativeHost(props, ref) {
    React.useImperativeHandle(ref, () => ({ handle: 100, setNativeProps() {} }), []);
    if (props.onLayout) layout = props.onLayout;
    return React.createElement(React.Fragment, null, props.children);
  });
  const native = {
    AccessibilityInfo: { setAccessibilityFocus: (handle) => focus.push(handle) },
    findNodeHandle: (node) => {
      assert.notEqual(platform, 'web', 'findNodeHandle is unsupported on web');
      return node?.handle ?? null;
    },
    Keyboard: {
      ...(platform === 'web' ? {} : { metrics: () => null }),
      addListener: () => ({ remove() {} }),
    },
    Platform: { OS: platform },
    StatusBar: { currentHeight: 0 },
    Modal: function MockModal(props) {
      modal = props;
      // RN Web with animationType=none emits onShow in a child passive effect.
      React.useEffect(() => {
        if (platform === 'web' && props.visible) props.onShow();
      }, [props.visible]);
      return props.visible ? props.children : null;
    },
    Pressable: Host,
    ScrollView: Host,
    Text: Host,
    View: Host,
    StyleSheet: { absoluteFill: {} },
    useWindowDimensions: () => ({ width: 400, height: 800 }),
  };
  const cache = new Map();
  function load(name) {
    if (cache.has(name)) return cache.get(name);
    const url = new URL(`../src/${name}`, import.meta.url);
    const output = ts.transpileModule(readFileSync(url, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    const module = { exports: {} };
    const require = (specifier) => {
      if (specifier === 'react' || specifier === 'react/jsx-runtime') return tooling(specifier);
      if (specifier === 'react-native') return native;
      if (specifier === './theme')
        return {
          useTheme: () => ({ colors: {}, radius: {}, layer: {}, spacing: {}, fontSize: {} }),
          ThemeProvider: (props) => props.children,
        };
      if (specifier === './focus') return load('focus.ts');
      if (specifier === './position') return load('position.ts');
      throw new Error(`Unexpected import ${specifier}`);
    };
    runInThisContext(`(function(require, module, exports) {${output}\n})`, {
      filename: fileURLToPath(url),
    })(require, module, module.exports);
    cache.set(name, module.exports);
    return module.exports;
  }
  const { Popover } = load('popover.tsx');
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const target = (handle) => ({
    current: { handle, focus: () => inputFocus.push(handle) },
  });
  const trigger = target(1);
  const first = target(2);
  let props = {
    open: true,
    onClose() {},
    accessibilityLabel: '菜单',
    triggerRef: trigger,
    initialFocusRef: first,
    fallbackFocusRef: target(3),
  };
  const render = (updates = {}) => {
    props = { ...props, ...updates };
    React.act(() => root.render(React.createElement(Popover, props, 'content')));
  };
  const flush = () =>
    React.act(() => {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((callback) => callback(0));
    });
  const relayout = () =>
    React.act(() => {
      layout({ nativeEvent: { layout: { width: 320, height: 120 } } });
    });
  const show = () => {
    React.act(() => modal.onShow());
    relayout();
  };
  let unmounted = false;
  const unmount = () => {
    if (!unmounted) React.act(() => root.unmount());
    unmounted = true;
  };
  dispose = () => {
    unmount();
    container.remove();
    globalThis.requestAnimationFrame = previousRaf;
    globalThis.cancelAnimationFrame = previousCancel;
  };
  render();
  return {
    render,
    show,
    relayout,
    flush,
    target,
    trigger,
    focus,
    inputFocus,
    frames,
    dismiss: () => React.act(() => modal.onDismiss()),
    unmount,
  };
}

test('open fallback ref replacement preserves onShow/layout readiness for submenu entry', () => {
  const h = harness();
  h.show();
  h.flush();
  assert.deepEqual(h.focus, [2]);
  h.render({ fallbackFocusRef: h.target(4) });
  assert.equal(h.frames.size, 0, 'a ref update alone must not trigger focus');
  h.render({ focusKey: 'child menu', initialFocusRef: h.target(5) });
  h.relayout(); // Modal stays visible: deliberately do not send onShow again.
  h.flush();
  assert.deepEqual(h.focus, [2, 5]);
});

test('fallback ref replacement between close and RAF preserves mounted trigger restore', () => {
  const h = harness();
  h.show();
  h.flush();
  h.render({ open: false });
  assert.equal(h.frames.size, 1);
  h.render({ fallbackFocusRef: h.target(4) });
  assert.equal(h.frames.size, 1, 'pending restore must not be cancelled by a ref update');
  h.flush();
  assert.deepEqual(h.focus, [2, 1]);
  assert.deepEqual(h.inputFocus, [2, 1]);
});

test('queued entry reads the latest initial focus ref without rescheduling', () => {
  const h = harness();
  h.show();
  const pending = h.frames.size;
  assert.equal(pending, 1);
  h.render({ initialFocusRef: h.target(5) });
  assert.equal(h.frames.size, pending);
  h.flush();
  assert.deepEqual(h.focus, [5]);
});

test('queued restore reads a replacement trigger and otherwise the latest mounted fallback', () => {
  const h = harness();
  h.show();
  h.flush();
  h.render({ open: false });
  const replacement = h.target(6);
  h.render({ triggerRef: replacement });
  h.flush();
  assert.deepEqual(h.focus, [2, 6]);
  h.render({ open: true });
  h.show();
  h.flush();
  h.render({ open: false });
  replacement.current = null;
  h.render({ fallbackFocusRef: h.target(7) });
  h.flush();
  assert.deepEqual(h.focus, [2, 6, 2, 7]);
});

test('iOS dismiss schedules restore using the latest refs at RAF execution', () => {
  const h = harness('ios');
  h.show();
  h.flush();
  h.render({ open: false });
  assert.equal(h.frames.size, 0, 'iOS waits for onDismiss');
  h.dismiss();
  h.trigger.current = null;
  h.render({ fallbackFocusRef: h.target(8) });
  h.flush();
  assert.deepEqual(h.focus, [2, 8]);
});

test('open transitions and unmount still cancel stale focus frames', () => {
  const h = harness();
  h.show();
  h.flush();
  h.render({ open: false });
  assert.equal(h.frames.size, 1);
  h.render({ open: true });
  assert.equal(h.frames.size, 0);
  h.show();
  assert.equal(h.frames.size, 1);
  h.unmount();
  assert.equal(h.frames.size, 0);
  h.flush();
  assert.deepEqual(h.focus, [2]);
});

test('web without Keyboard.metrics focuses component refs without native handles', () => {
  const h = harness('web');
  h.relayout(); // onShow has already fired from the Modal's passive effect.
  h.flush();
  h.render({ open: false });
  h.flush();
  assert.deepEqual(h.inputFocus, [2, 1]);
  assert.deepEqual(h.focus, [], 'web does not use native accessibility focus handles');
});
