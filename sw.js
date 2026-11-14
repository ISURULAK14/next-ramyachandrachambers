const CACHE_NAME = 'rgchambers-v12.0.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/practice-areas.html',
  '/testimonials.html',
  '/faq.html',
  '/contact.html',
  '/notary-public-matara.html',
  '/deed-lawyer-matara.html',
  '/company-registration-matara.html',
  '/overseas-power-of-attorney-sri-lanka.html',
  '/land-registry-title-search-sri-lanka.html',
  '/company-registration-sri-lanka-beneficial-ownership.html',
  '/land-partition-law-procedure-sri-lanka.html',
  '/foreign-investment-property-acquisition-sri-lanka.html',
  '/last-will-testamentary-probate-sri-lanka.html',
  '/privacy-policy.html',
  '/terms-of-engagement.html',
  '/css/style.min.css?v=11.0.0',
  '/css/style.css',
  '/js/main.min.js?v=11.0.0',
  '/js/main.js',
  '/js/frosted-glass-bg.js?v=6.0.0',
  '/js/vendor/three.module.js',
  '/js/vendor/three.core.js',
  '/assets/frosted-normal.png',
  '/searchlogo.svg',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/site.webmanifest',
  '/photo.webp',
  '/fort.webp',
  '/kotavila1.webp',
  '/kotavila2.webp',
  '/world_map.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore analytics and chrome-extension
  if (url.origin !== self.location.origin) {
    if (url.hostname.includes('google-analytics') || url.hostname.includes('googletagmanager')) {
      return;
    }
  }

  // Network-First for HTML navigation
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cached => cached || caches.match('/'));
        })
    );
    return;
  }

  // Stale-While-Revalidate for Static Assets
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return networkResponse;
      }).catch(() => {});

      return cachedResponse || fetchPromise;
    })
  );
});
