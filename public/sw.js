/**
 * sw.js — منصة خطوة التعليمية
 *
 * استراتيجية: injectManifest مع vite-plugin-pwa
 * الـ plugin بيحقن self.__WB_MANIFEST تلقائياً عند البناء.
 * ده بيضمن إن كل ملف JS/CSS له hash صح في الكاش،
 * وبعد أي deploy، الكاش القديم بيتحذف تلقائياً.
 *
 * ⚠️ ملاحظة: self.__WB_MANIFEST بيتحقن بـ vite-plugin-pwa
 * لو شغّلنا sw.js يدوي من غير build، هيرجع []
 */

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// ── 1. Precache: كل ملفات JS/CSS/HTML المبنية بـ Vite (مع hashes) ──────────
// self.__WB_MANIFEST بيتحقن تلقائياً بـ vite-plugin-pwa وبيحتوي على:
// [{ url: '/assets/main-abc123.js', revision: null }, ...]
precacheAndRoute(self.__WB_MANIFEST || []);

// ── 2. امسح كاش الإصدارات القديمة فوراً ──────────────────────────────────
cleanupOutdatedCaches();

// ── 3. Navigation fallback → دايماً ارجع index.html للـ SPA ────────────────
// ده بيحل مشكلة: فتح /student/home مباشرة من أيقونة PWA → 404
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/"), {
    // استثنِ روابط API والملفات الثابتة
    denylist: [/^\/api\//, /\.(png|jpg|jpeg|gif|webp|svg|ico|pdf|js|css)$/i],
  })
);

// ── 4. API calls → Network only (لا كاش أبداً) ───────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({ networkTimeoutSeconds: 15 })
);

// ── 5. Google Fonts / CDN → StaleWhileRevalidate ─────────────────────────
registerRoute(
  ({ url }) =>
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com"),
  new StaleWhileRevalidate({ cacheName: "google-fonts" })
);

// ── 6. Cloudinary images → CacheFirst (30 days) ───────────────────────────
registerRoute(
  ({ url }) => url.hostname.includes("cloudinary.com"),
  new CacheFirst({
    cacheName: "cloudinary-images",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// ── Install: skipWaiting فوراً ────────────────────────────────────────────
self.addEventListener("install", () => self.skipWaiting());

// ── Activate: سيطر على كل التابات فوراً ─────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    self.clients
      .claim()
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) =>
        clients.forEach((c) =>
          c.postMessage({ type: "SW_UPDATED", version: self.__WB_MANIFEST?.length || 0 })
        )
      )
  );
});

// ── Messages ──────────────────────────────────────────────────────────────
self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (e.data?.type === "CLEAR_CACHE") {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});