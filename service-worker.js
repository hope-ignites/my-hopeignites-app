// Service Worker for Hope Ignites Application Launcher PWA
// Version: 1.1 - Improved caching strategy
const CACHE_NAME = 'hopeignites-app-launcher-v1.1';
const STATIC_CACHE = 'hopeignites-static-v1.1';
const IMAGE_CACHE = 'hopeignites-images-v1.1';
const DATA_CACHE = 'hopeignites-data-v1.1';

// Core static assets that should be cached on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  '/manifest.json'
];

// Logo and badge images
const IMAGE_ASSETS = [
  '/assets/light-logo.png',
  '/assets/dark-logo.png',
  '/assets/universal.png',
  '/assets/sso-badge.png',
  '/assets/hq-badge.png'
];

// Data files that might change more frequently
const DATA_ASSETS = [
  '/portal-data.json'
];

// Install event - cache core resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(IMAGE_CACHE).then((cache) => cache.addAll(IMAGE_ASSETS)),
      caches.open(DATA_CACHE).then((cache) => cache.addAll(DATA_ASSETS))
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, IMAGE_CACHE, DATA_CACHE, CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different asset types with appropriate strategies
  if (request.method !== 'GET') {
    return; // Only cache GET requests
  }

  // Static assets - Cache first, fall back to network
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Images - Cache first, fall back to network
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          if (fetchResponse && fetchResponse.status === 200) {
            return caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, fetchResponse.clone());
              return fetchResponse;
            });
          }
          return fetchResponse;
        });
      })
    );
    return;
  }

  // Data files - Network first, fall back to cache (stale-while-revalidate)
  if (DATA_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) => {
        return fetch(request).then((fetchResponse) => {
          // Update cache with fresh data
          if (fetchResponse && fetchResponse.status === 200) {
            cache.put(request, fetchResponse.clone());
          }
          return fetchResponse;
        }).catch(() => {
          // Fall back to cached version if offline
          return cache.match(request);
        });
      })
    );
    return;
  }

  // External requests - Network only (API calls, analytics)
  if (url.origin !== location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  // Everything else - Network first, fall back to cache
  event.respondWith(
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(request);
    })
  );
});
