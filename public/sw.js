// Bump on any change to the strategies below; activation drops every other MuHub cache.
const CACHE_NAME = 'muhub-v1';
const APP_SHELL_URL = '/';
const PRECACHE_URLS = [
  APP_SHELL_URL,
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon/icon-192.png',
  '/icon/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll(PRECACHE_URLS))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(names => Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))))
    .then(() => self.clients.claim()));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
  return response;
}

// Online users always see fresh data; the cached copy only serves offline reads.
async function networkFirst(request, cacheKey = request) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(CACHE_NAME)).put(cacheKey, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(cacheKey);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  // Writes must reach the server, and cross-origin requests (Google Fonts) keep browser defaults.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Every client route renders from the same index.html, so one cached shell covers them all.
  if (request.mode === 'navigate') event.respondWith(networkFirst(request, APP_SHELL_URL));
  // Vite fingerprints /assets/ file names, so a cached copy can never be stale.
  else if (url.pathname.startsWith('/assets/')) event.respondWith(cacheFirst(request));
  else event.respondWith(networkFirst(request));
});
