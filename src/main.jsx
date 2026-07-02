import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';
import { ThemeProvider } from '@/contexts/ThemeContext.jsx';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';

// ── Global Error Logging ──────────────────────────────────────────────────────
// بيمسك أي خطأ غير متوقع بدل ما التطبيق يقع صامت على الأجهزة

window.addEventListener('error', (e) => {
  console.error('[Global Error]', e.message, '|', e.filename, ':', e.lineno, e.error);
  // لو الخطأ في ملف JS أساسي (assets) → مشكلة كاش قديم → امسحه وأعد التحميل
  if (e.filename && e.filename.includes('/assets/') && e.message?.includes('SyntaxError')) {
    console.warn('[PWA] Stale cache detected — clearing and reloading');
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .then(() => window.location.reload());
    }
  }
});

window.addEventListener('unhandledrejection', (e) => {
  // تجاهل errors الـ network العادية (fetch failed, axios timeout)
  const msg = e.reason?.message || String(e.reason);
  if (msg.includes('Network Error') || msg.includes('timeout') || msg.includes('fetch')) return;
  console.error('[Unhandled Promise Rejection]', e.reason);
});

// ── Polyfill: Promise.allSettled (مش موجود في Chrome < 76) ──────────────────
if (!Promise.allSettled) {
  Promise.allSettled = (promises) =>
    Promise.all(promises.map(p =>
      Promise.resolve(p)
        .then(value  => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected',  reason }))
    ));
}

// ── Polyfill: structuredClone (مش موجود في Chrome < 98) ─────────────────────
if (typeof structuredClone === 'undefined') {
  window.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// ── Polyfill: queueMicrotask (Chrome < 71) ──────────────────────────────────
if (typeof queueMicrotask === 'undefined') {
  window.queueMicrotask = (fn) => Promise.resolve().then(fn);
}

// ── Mount React ───────────────────────────────────────────────────────────────
const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<p style="color:red;text-align:center;margin-top:40px">خطأ: لا يمكن تحميل التطبيق. يرجى إعادة المحاولة.</p>';
} else {
  ReactDOM.createRoot(rootEl).render(
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  );
}