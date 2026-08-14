// ANCLA Special Projects - Service Worker PWA v1.0.3
const CACHE_NAME = 'ancla-crm-cache-v1.0.3';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon-180x180.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🧹 Eliminando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass API and WebSocket requests
  if (url.pathname.startsWith('/api') || url.protocol.startsWith('ws')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses for static assets
        if (response.status === 200 && event.request.method === 'GET' && (url.pathname.endsWith('.png') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.webmanifest'))) {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, respClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});
