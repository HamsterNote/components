import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// notes 的指针选区逻辑依赖该浏览器 API，jsdom 尚未实现它。
Object.defineProperty(document, 'caretPositionFromPoint', {
  configurable: true,
  value: () => null,
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});
