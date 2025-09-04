// Simple Service Worker with basic caching strategies
const VERSION = 'v1.0.1';
const PRECACHE = `precache-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;

// لا تقم بتخزين الصفحة الرئيسية حتى لا نثبّت نسخة قديمة من الـ HTML
const PRECACHE_URLS = [
  '/manifest.json',
  '/favicon.ico',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => {
      if (!key.includes(VERSION)) {
        return caches.delete(key);
      }
    }))).then(() => self.clients.claim())
  );
});

// دعم الرسائل (مثلاً skipWaiting يدوي)
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function fromNetwork(request, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(reject, timeoutMs);
    fetch(request).then((response) => {
      clearTimeout(timeoutId);
      resolve(response);
    }, reject);
  });
}

function staleWhileRevalidate(event) {
  return caches.open(RUNTIME).then((cache) => {
    return cache.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      }).catch(() => cached);
      return cached || fetchPromise;
    });
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET
  if (request.method !== 'GET') return;

  // استثناء مسارات HMR و Next assets حتى لا نكسر Fast Refresh
  if (url.pathname.startsWith('/_next/') || url.pathname.includes('hot-update')) {
    return;
  }

  // API: network-first with short timeout
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fromNetwork(request).catch(() => caches.match(request))
    );
    return;
  }

  // Images: stale-while-revalidate
  if (request.destination === 'image' || url.hostname.endsWith('images.unsplash.com')) {
    event.respondWith(staleWhileRevalidate(event));
    return;
  }

  // Navigation/documents: network-first then cache مع صفحة Offline إن توفرت
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(RUNTIME).then((cache) => cache.put(request, copy));
        return response;
      }).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const offline = await caches.match('/offline');
        return offline || Response.error();
      })
    );
    return;
  }

  // Default: try cache, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});