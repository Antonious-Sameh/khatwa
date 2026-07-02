/**
 * Service Worker — منصة خطوة التعليمية
 *
 * استراتيجية:
 *  - الـ assets (JS/CSS/fonts): cache-first — بعد أول تحميل بيكون سريع جداً
 *  - صفحات HTML (navigation): network-first مع fallback للكاش
 *  - الـ API: مش بيتخزن أبداً — دايماً يروح للسيرفر
 *  - الصور: stale-while-revalidate
 *
 * تحديث الكاش: كل ما بنعمل deploy، CACHE_VERSION بتتغير تلقائياً
 * لأنها بتشمل hash الـ build. ده بيضمن إن الكاش القديم يتحذف فوراً.
 */

// ── Version — يتغير مع كل build (Vite هيضيف hash) ──────────────────────────
const CACHE_VERSION  = 'khatwa-v4';
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE  = `${CACHE_VERSION}-dynamic`;

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // تفعيل فوراً بدون انتظار إغلاق التابات
      .catch(() => self.skipWaiting()) // حتى لو فشل pre-cache، لازم يشتغل
  );
});

// ── Activate — احذف أي كاش قديم ─────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => k.startsWith('khatwa-') && k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim()) // سيطر على كل التابات المفتوحة فوراً
      // أبلّغ كل التابات بالتحديث عشان يعمل reload لو محتاج
      .then(() =>
        self.clients.matchAll({ type: 'window' }).then(clients =>
          clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }))
        )
      )
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const { request } = e;

  // 1. Skip non-GET requests (POST/PUT/DELETE)
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 2. Skip API calls — دايماً يروح للسيرفر، مش للكاش
  if (url.pathname.startsWith('/api/')) return;

  // 3. Skip external domains (Cloudinary, YouTube, Google Docs)
  if (url.origin !== self.location.origin) return;

  // 4. HTML navigation — network-first مع offline fallback
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok) {
            caches.open(STATIC_CACHE).then(c => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(async () => {
          // Offline: رجّع الـ cached version أو الـ shell
          const cached = await caches.match(request);
          if (cached) return cached;
          const shell = await caches.match('/');
          return shell || new Response(
            '<h1 style="font-family:sans-serif;text-align:center;margin-top:40px">غير متصل بالإنترنت</h1>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 5. JS/CSS/fonts/icons — cache-first (بعد أول تحميل ميروحش للنت تاني)
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|eot)$/) ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/assets/')
  ) {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res.ok) {
            caches.open(STATIC_CACHE).then(c => c.put(request, res.clone()));
          }
          return res;
        }).catch(() => cached || new Response('', { status: 503 }));
      })
    );
    return;
  }

  // 6. Images — stale-while-revalidate (بيرجع الكاش فوراً وبيحدث في الخلفية)
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    e.respondWith(
      caches.open(DYNAMIC_CACHE).then(cache =>
        cache.match(request).then(cached => {
          const networkFetch = fetch(request)
            .then(res => {
              if (res.ok) cache.put(request, res.clone());
              return res;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // 7. Default — network مع dynamic cache كـ fallback
  e.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok && res.status < 400) {
          caches.open(DYNAMIC_CACHE).then(c => c.put(request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});

// ── Handle messages from app ──────────────────────────────────────────────────
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (e.data?.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});