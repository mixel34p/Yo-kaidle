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
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png'
  };

  event.waitUntil(
    self.registration.showNotification('Yo-kaidle', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://yokaidle.vercel.app')
  );
});
