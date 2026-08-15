// ANCLA Special Projects - Service Worker PWA v1.5.1
const CACHE_NAME = 'ancla-crm-cache-v1.5.1';
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
// Manejador de Notificaciones Push nativas con Agrupación Inteligente Estilo WhatsApp
self.addEventListener('push', (event) => {
  let incoming = {
    title: 'ANCLA CRM',
    body: 'Nuevo mensaje recibido en ANCLA CRM',
    icon: '/ancla_app_icon_192.png',
    badge: '/notification-badge.png',
    contact_name: 'Prospecto',
    contact_id: null,
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      incoming = { ...incoming, ...parsed };
      if (parsed.data) {
        incoming.data = { ...incoming.data, ...parsed.data };
      }
    } catch (e) {
      incoming.body = event.data.text() || incoming.body;
    }
  }

  // Extraer nombre del remitente del título si viene como "💬 Nombre"
  let senderName = incoming.contact_name || incoming.title.replace(/^💬\s*/, '').strip?.() || 'Nuevo Prospecto';
  if (incoming.title && incoming.title.startsWith('💬 ')) {
    senderName = incoming.title.replace(/^💬\s*/, '');
  }

  const messageText = incoming.body;
  const contactId = incoming.data?.contact_id || incoming.contact_id || senderName;

  event.waitUntil(
    (async () => {
      // 1. Reproducir el tono oficial de doble pulso idéntico al CRM
      await playNotificationSound();

      // 2. Consultar notificaciones previas aún no leídas en la barra del sistema para agrupar estilo WhatsApp
      const existingNotifs = await self.registration.getNotifications();
      let notifTitle = `💬 ${senderName}`;
      let notifBody = messageText;
      let notifTag = `ancla_chat_${contactId}`;

      if (existingNotifs && existingNotifs.length > 0) {
        let unreadMap = new Map(); // Map de contactName -> [mensajes]
        
        // Agregar notificaciones anteriores activas
        for (let n of existingNotifs) {
          const cName = n.data?.senderName || n.title.replace(/^💬\s*/, '');
          const prevMsgs = n.data?.messages || [n.body];
          if (!unreadMap.has(cName)) {
            unreadMap.set(cName, []);
          }
          unreadMap.get(cName).push(...prevMsgs);
        }

        // Agregar el mensaje entrante actual
        if (!unreadMap.has(senderName)) {
          unreadMap.set(senderName, []);
        }
        unreadMap.get(senderName).push(messageText);

        const totalChats = unreadMap.size;
        let totalMessages = 0;
        unreadMap.forEach((msgs) => totalMessages += msgs.length);

        if (totalChats === 1) {
          // Caso A: Múltiples mensajes de UN solo chat (ej: Diego Machado Leon)
          const singleMsgs = unreadMap.get(senderName);
          notifTitle = `💬 ${senderName}`;
          if (singleMsgs.length > 1) {
            notifBody = singleMsgs.map(m => `• ${m}`).join('\n');
          } else {
            notifBody = singleMsgs[0];
          }
          notifTag = `ancla_chat_${contactId}`;
        } else {
          // Caso B: Mensajes de MÚLTIPLES chats (ej: WhatsApp · 2 mensajes de 2 chats)
          notifTitle = `ANCLA CRM · ${totalMessages} mensajes de ${totalChats} chats`;
          let lines = [];
          unreadMap.forEach((msgs, cName) => {
            const lastMsg = msgs[msgs.length - 1];
            lines.push(`${cName}: ${lastMsg}`);
          });
          notifBody = lines.join('\n');
          notifTag = 'ancla_summary_notification';
        }
      }

      const options = {
        body: notifBody,
        icon: '/ancla_app_icon_192.png',
        badge: '/notification-badge.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: notifTag,
        renotify: true,
        requireInteraction: false,
        actions: [
          { action: 'open_chat', title: '💬 Abrir Chat' }
        ],
        data: {
          dateOfArrival: Date.now(),
          url: incoming.data?.url || incoming.url || '/',
          senderName: senderName,
          messages: [messageText]
        }
      };

      return self.registration.showNotification(notifTitle, options);
    })()
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

