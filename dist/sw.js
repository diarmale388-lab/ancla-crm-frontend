// ANCLA Special Projects - Service Worker PWA v1.5.0
const CACHE_NAME = 'ancla-crm-cache-v1.5.0';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/notification.wav',
  '/notification-badge.png',
  '/ancla_app_icon_192.png',
  '/ancla_app_icon_512.png',
  '/ancla_apple_icon_180.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/favicon.ico'
];

// Reproducir sonido de notificación desde el Service Worker (Chrome 116+, Edge, Firefox)
// Funciona con pantalla bloqueada y app en background porque corre en el hilo del SW
async function playNotificationSound() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/notification.wav');
    if (!response) return;

    const arrayBuffer = await response.clone().arrayBuffer();
    const AudioCtx = self.AudioContext || self.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (e) {
    // AudioContext no disponible en este SW (iOS/Safari) — silencioso, se usa tono del sistema
  }
}

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

// Listener de mensajes directos desde la aplicación web para mostrar notificaciones nativas en barra superior (Android, iOS PWA y Windows)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag } = event.data.payload || {};
    const options = {
      body: body || 'Nuevo mensaje pendiente por leer en ANCLA CRM',
      icon: icon || '/ancla_app_icon_192.png',
      badge: '/notification-badge.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: tag || 'ancla_pwa_notification',
      renotify: true,
      data: { url: '/' }
    };
    event.waitUntil(
      self.registration.showNotification(title || 'ANCLA CRM', options)
        .then(() => playNotificationSound())
    );
  }
});

// Manejador de Notificaciones Push nativas para Android, iOS (PWA 16.4+) y PC en segundo plano
self.addEventListener('push', (event) => {
  let data = {
    title: 'ANCLA CRM',
    body: 'Tienes un nuevo mensaje o actualización en ANCLA CRM',
    icon: '/ancla_app_icon_192.png',
    badge: '/notification-badge.png',
    tag: 'ancla-push-notification',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
      if (parsed.data) {
        data.data = { ...data.data, ...parsed.data };
      }
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/ancla_app_icon_192.png',
    badge: data.badge || '/notification-badge.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || `ancla_push_${Date.now()}`,
    renotify: true,
    requireInteraction: false,
    actions: [
      { action: 'open_chat', title: '💬 Abrir Chat' }
    ],
    data: {
      dateOfArrival: Date.now(),
      url: data.data?.url || data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ANCLA CRM', options)
      .then(() => playNotificationSound())
      .catch((err) => console.error('Error al mostrar notificación push en SW:', err))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. Si ya hay una pestaña abierta con el CRM, enfocarla y navegar a la URL
      for (let client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            if ('navigate' in client && urlToOpen !== '/') {
              client.navigate(urlToOpen);
            }
            return client.focus();
          }
        }
      }
      // 2. Si no hay pestaña abierta, abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

