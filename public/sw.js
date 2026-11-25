const CACHE_NAME = 'tarawih-cache-v3';

self.addEventListener('install', (event) => {
  // Immediately activate new service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      // Purge all old caches
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Never cache Firestore or Google APIs
  if (
    event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('firebaseio.com') ||
    event.request.url.includes('googleapis.com')
  ) {
    return;
  }

  // Network First for all documents, JS and CSS to ensure instant updates
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache only when truly offline
        return caches.match(event.request);
      })
  );
});
