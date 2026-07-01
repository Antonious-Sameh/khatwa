const CACHE_VERSION  = 'khatwa-v1';
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE  = `${CACHE_VERSION}-dynamic`;

// Assets to pre-cache on install
const PRECACHE_URLS = ['/', '/manifest.json'];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(c => c.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate — clean old caches ──────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('khatwa-') && k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch strategy ────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip: non-GET, API calls, external domains (YouTube etc)
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.origin !== self.location.origin) return;

  // HTML navigation — network-first (always fresh shell)
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match('/') || caches.match(request))
    );
    return;
  }

  // JS / CSS / fonts / icons — cache-first
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf)$/) ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/assets/')
  ) {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Images — stale-while-revalidate
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    e.respondWith(
      caches.open(DYNAMIC_CACHE).then(cache =>
        cache.match(request).then(cached => {
          const fetchPromise = fetch(request).then(res => {
            cache.put(request, res.clone());
            return res;
          });
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Default — network with dynamic cache fallback
  e.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) {
          caches.open(DYNAMIC_CACHE).then(c => c.put(request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});