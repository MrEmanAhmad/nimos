// Nimo's Service Worker - Offline-first PWA support
const CACHE_NAME = 'nimos-v2';
const OFFLINE_URL = '/offline.html';

// App shell files to pre-cache on install
const APP_SHELL = [
  '/',
  '/offline.html',
  '/favicon.png',
  '/images/logo.png',
  '/images/logo.webp',
  '/images/hero-bg.webp',
  '/manifest.json',
];

// Maximum age for API cache entries (5 minutes)
const API_CACHE_MAX_AGE = 5 * 60 * 1000;

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  // Activate immediately without waiting for old SW to finish
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Claim all open clients immediately
  self.clients.claim();
});

// Fetch: apply appropriate caching strategy per request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Skip non-GET requests (POST, PUT, DELETE for API mutations)
  if (request.method !== 'GET') return;

  // Skip SSE/streaming endpoints — let browser handle directly
  if (url.pathname.includes('/stream')) return;

  // API calls: network-first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Hashed static assets (e.g. /assets/index-BGuLzVkq.js): cache-first (immutable)
  // Vite output includes content hashes so these files never change
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Other static assets (images, fonts, etc.): stale-while-revalidate
  // Serve from cache immediately but update in the background
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ttf|eot|ico|json)$/)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Navigation requests (HTML pages): network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Everything else: network-first
  event.respondWith(networkFirst(request));
});

// ---- Caching strategies ----

// Cache-first: serve from cache; only fetch on cache miss (ideal for hashed/immutable assets)
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Stale-while-revalidate: serve from cache immediately, update cache in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fire off network fetch to update the cache in the background
  const networkPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  // Return cached version immediately if available, otherwise wait for network
  if (cached) return cached;

  const networkResponse = await networkPromise;
  return networkResponse || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}

// Network-first: try network, fall back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first for navigations: show offline page if both fail
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Show offline fallback page
    const offlinePage = await caches.match(OFFLINE_URL);
    return offlinePage || new Response(
      '<html><body style="background:#080808;color:#e0e0e0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><div style="text-align:center"><h1 style="color:#e94560;font-size:2rem">You are offline</h1><p>Please check your internet connection and try again.</p></div></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
