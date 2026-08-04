import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@hamster-note/components/styles.css';
import '@hamster-note/components-pro/styles.css';
import { DemoApp } from './DemoApp';
import './demo.css';
import './demo-code.css';
import './confirm-demo.css';
import './dialog-demo.css';
import './drawer-demo.css';
import './icon-demo.css';
import './kbd-demo.css';
import './loading-demo.css';
import './menu-demo.css';
import './popover-demo.css';
import './theme-demo.css';
import './responsive.css';

const rootElement = document.querySelector('#root');

if (!(rootElement instanceof HTMLElement)) {
  throw new Error('Demo root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);
