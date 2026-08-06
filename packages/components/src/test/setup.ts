import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import { hideLoading } from '../components/loading';

afterEach(() => {
  hideLoading();
  cleanup();
  document.body.style.overflow = '';
});
