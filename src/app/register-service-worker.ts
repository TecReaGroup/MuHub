import { log, serializeError } from '../shared/lib/logger';

const SERVICE_WORKER_URL = '/sw.js';

/** Makes the app installable and readable offline; skipped in dev so cached files never shadow Vite HMR. */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SERVICE_WORKER_URL)
      .then(registration => log('info', 'PWA', 'Service worker registered', { scope: registration.scope }))
      .catch(error => log('warn', 'PWA', 'Service worker registration failed', serializeError(error)));
  });
}
