const CACHE_NAME = 'legue-leozinho-v14';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/css/style.css',
  '/src/js/supabase-config.js',
  '/src/js/supabase-client.js',
  '/src/vendor/supabase-js.min.js',
  '/src/js/special-hearts.js',
  '/src/js/script.js',
  '/src/js/back-buttons.js',
  '/src/js/profile-photos.js',
  '/src/js/profile-characteristics.js',
  '/src/js/cineminha.js',
  '/src/js/love-map.js',
  '/src/js/agenda-amor.js',
  '/src/js/nosso-mural.js',
  '/src/assets/icons/apple-touch-icon.png',
  '/src/assets/icons/icon-192.png',
  '/src/assets/icons/icon-512.png',
  '/pages/legue.html',
  '/pages/leozinho.html',
  '/pages/cineminha.html',
  '/pages/cineminha-2026.html',
  '/pages/cineminha-2025.html',
  '/pages/cineminha-2024.html',
  '/pages/cineminha-2023.html',
  '/pages/certificado.html',
  '/pages/mapa-amor.html',
  '/pages/agenda-amor.html',
  '/pages/nosso-mural.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const fresh = fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fresh;
    })
  );
});
