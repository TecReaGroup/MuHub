// Fonts are bundled and served from our origin, so the browser never contacts a font CDN.
import '@fontsource-variable/inter';
import '@fontsource-variable/noto-sans-sc';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { registerServiceWorker } from './app/register-service-worker';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
registerServiceWorker();
