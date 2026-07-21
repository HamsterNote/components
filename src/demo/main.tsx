import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../tokens.css';
import '../components/badge/badge.css';
import '../components/button/button.css';
import '../components/confirm/confirm.css';
import '../components/dialog/dialog.css';
import '../components/drawer/drawer.css';
import '../components/icon/icon.css';
import '../components/kbd/kbd.css';
import '../components/loading/loading.css';
import '../components/menu/menu.css';
import '../components/note-card/note-card.css';
import '../components/popover/popover.css';
import '../components/text-field/text-field.css';
import '../components/theme/theme.css';
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
