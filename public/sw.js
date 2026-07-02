/**
 * Service Worker — منصة خطوة التعليمية
 *
 * المشكلة الحقيقية التي كانت تسبب الـ Crash:
 * بعد deploy جديد، الـ SW القديم كان لسه شغال وبيجيب ملفات JS/CSS
 * بـ hash قديم من الكاش — لكن الـ index.html الجديد بيطلب ملفات بـ hash جديد.
 * النتيجة: 404 على ملفات JS → React مش بيقدر يشتغل → التطبيق بيقع.
 *
 * الحل:
 * 1. رفع CACHE_VERSION مع كل deploy (Vite مش بيعمله تلقائي في sw.js)
 * 2. عند activation: امسح أي كاش بـ version قديمة فوراً
 * 3. لو ملف JS وقع بـ 404: ابلّغ التطبيق يعمل hard reload
 */

const CACHE_VERSION = 'khatwa-v5';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const PRECACHE_URLS = ['/', '/manifest.json'];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(c => c.addAll(PRECACHE_URLS))
      .catch(() => {}) // لو pre-cache فشل، متوقفش
      .finally(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('khatwa-') && k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())
      .then(() =>
        self.clients.matchAll({ type: 'window' }).then(clients =>
          clients.forEach(c => c.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION }))
        )
      )
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // ❌ لا تخزن API calls أبداً
  if (url.pathname.startsWith('/api/')) return;

  // ❌ لا تخزن روابط خارجية
  if (url.origin !== self.location.origin) return;

  // ❌ لا تخزن Google Docs Viewer
  if (url.hostname === 'docs.google.com') return;

  // ── HTML navigation → network-first ──────────────────────────────────────
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok) caches.open(STATIC_CACHE).then(c => c.put(request, res.clone()));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match('/');
          return cached || new Response(
            `<!DOCTYPE html><html dir="rtl"><body style="font-family:sans-serif;text-align:center;padding:40px;background:#080d1a;color:#D4AF37">
              <h2>لا يوجد اتصال بالإنترنت</h2>
              <p>يرجى التحقق من الاتصال وإعادة المحاولة</p>
              <button onclick="location.reload()" style="background:#D4AF37;color:#080d1a;border:none;padding:10px 24px;border-radius:8px;font-size:16px;cursor:pointer;margin-top:12px">إعادة المحاولة</button>
            </body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // ── JS/CSS/fonts → cache-first + network fallback ────────────────────────
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|eot)$/) ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/assets/')
  ) {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (!res.ok) {
            // ❗ ملف JS/CSS مش موجود (هاش تغير بعد deploy)
            // بلّغ التطبيق يعمل cache clear وreload
            if (url.pathname.match(/\.(js|css)$/) && res.status === 404) {
              self.clients.matchAll({ type: 'window' }).then(clients =>
                clients.forEach(c => c.postMessage({ type: 'ASSET_NOT_FOUND', url: url.pathname }))
              );
            }
            return res;
          }
          caches.open(STATIC_CACHE).then(c => c.put(request, res.clone()));
          return res;
        }).catch(() => {
          if (cached) return cached;
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
    );
    return;
  }

  // ── Images → stale-while-revalidate ──────────────────────────────────────
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    e.respondWith(
      caches.open(DYNAMIC_CACHE).then(cache =>
        cache.match(request).then(cached => {
          const net = fetch(request).then(res => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          }).catch(() => cached);
          return cached || net;
        })
      )
    );
    return;
  }

  // ── Default → network + dynamic cache ────────────────────────────────────
  e.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) caches.open(DYNAMIC_CACHE).then(c => c.put(request, res.clone()));
        return res;
      })
      .catch(() => caches.match(request))
  );
});

// ── Messages from app ─────────────────────────────────────────────────────────
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.skipWaiting());
  }
});