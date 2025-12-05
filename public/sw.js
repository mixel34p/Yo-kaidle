const CACHE_NAME = 'yokaidle-v1';
const STATIC_CACHE_NAME = 'static-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-v1';

// Add the assets you want to cache
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/images/background.jpg',
  '/images/elements/*.png',
  '/images/foods/*.png',
  '/images/tribes/*.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cacheRes => {
        // Return cached response if found
        if (cacheRes) {
          return cacheRes;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then(fetchRes => {
            // Check if we received a valid response
            if (!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic') {
              return fetchRes;
            }

            // Clone the response
            const responseToCache = fetchRes.clone();

            // Store in dynamic cache
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return fetchRes;
          })
          .catch(() => {
            // If both cache and network fail, return offline fallback
            if (event.request.url.indexOf('.html') > -1) {
              return caches.match('/');
            }
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Yo-kaidle', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || '¡Un nuevo Yo-kai te espera hoy! 🎮',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'daily-yokai',
    requireInteraction: false,
    actions: [
      {
        action: 'play',
        title: '🎮 Jugar ahora'
      },
      {
        action: 'dismiss',
        title: '❌ Cerrar'
      }
    ],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Yo-kaidle', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Función para programar notificaciones diarias
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_DAILY_NOTIFICATION') {
    scheduleDailyNotification();
  }
});

function scheduleDailyNotification() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0); // 9:00 AM

  const timeUntilNotification = tomorrow.getTime() - now.getTime();

  // Solo programar si es en el futuro
  if (timeUntilNotification > 0) {
    setTimeout(() => {
      self.registration.showNotification('¡Nuevo Yo-kai disponible!', {
        body: '¡Un nuevo desafío diario te espera! ¿Podrás adivinar el Yo-kai de hoy?',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'daily-yokai',
        requireInteraction: false,
        actions: [
          {
            action: 'play',
            title: '🎮 Jugar ahora'
          },
          {
            action: 'dismiss',
            title: '❌ Más tarde'
          }
        ],
        data: {
          url: '/',
          timestamp: Date.now()
        }
      });

      // Programar la siguiente notificación
      scheduleDailyNotification();
    }, timeUntilNotification);
  }
}
