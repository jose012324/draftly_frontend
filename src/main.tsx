import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/dashboard.css';
import './styles/editor.css';
import './styles/auth.css';
import './styles/landing.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
