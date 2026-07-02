/**
 * main.jsx — نقطة دخول التطبيق
 *
 * الترتيب المهم هنا:
 * 1. Polyfills أولاً (قبل أي import تاني)
 * 2. Global error handlers
 * 3. Debug logging لتتبع مكان الـ Crash
 * 4. React render
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';
import { ThemeProvider } from '@/contexts/ThemeContext.jsx';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';

// ── Polyfills (Chrome 80+ compat) ─────────────────────────────────────────────
if (!Promise.allSettled) {
  Promise.allSettled = (ps) =>
    Promise.all(ps.map(p =>
      Promise.resolve(p)
        .then(v  => ({ status: 'fulfilled', value: v }))
        .catch(r => ({ status: 'rejected',  reason: r }))
    ));
}
if (typeof structuredClone === 'undefined') {
  window.structuredClone = (obj) => {
    try { return JSON.parse(JSON.stringify(obj)); } catch { return obj; }
  };
}
if (typeof queueMicrotask === 'undefined') {
  window.queueMicrotask = (fn) => Promise.resolve().then(fn).catch(console.error);
}

// ── Startup Debug Log ─────────────────────────────────────────────────────────
// هذه اللوجز بتظهر في Chrome DevTools (chrome://inspect)
// حتى على الأجهزة المتصلة عن بُعد
const dbg = (...args) => console.error('[Khatwa Boot]', ...args); // error عشان يظهر حتى مع فلتر

dbg('▶ main.jsx started');
dbg('userAgent:', navigator.userAgent);
dbg('standalone:', window.matchMedia('(display-mode: standalone)').matches);
dbg('online:', navigator.onLine);
dbg('React:', React.version);

// ── Global Error Handlers ─────────────────────────────────────────────────────
window.addEventListener('error', (e) => {
  console.error('[Global JS Error]', {
    message: e.message,
    file: e.filename,
    line: e.lineno,
    col: e.colno,
    stack: e.error?.stack,
  });

  // إذا كان الخطأ في ملف asset محدد → محتمل stale cache → امسحه وأعد التحميل
  if (
    e.filename?.includes('/assets/') &&
    (e.message?.includes('SyntaxError') || e.message?.includes('Unexpected token'))
  ) {
    console.error('[Khatwa] Stale JS detected — clearing caches and reloading');
    try {
      if ('caches' in window) {
        caches.keys()
          .then(keys => Promise.all(keys.map(k => caches.delete(k))))
          .then(() => { window.location.reload(); });
      } else {
        window.location.reload();
      }
    } catch {}
  }
});

window.addEventListener('unhandledrejection', (e) => {
  const msg = String(e.reason?.message || e.reason || '');
  // تجاهل أخطاء الشبكة العادية (axios timeout وكده)
  if (msg.includes('Network Error') || msg.includes('timeout') || msg.includes('ECONNABORTED')) return;
  console.error('[Unhandled Rejection]', e.reason);
});

// ── Render ────────────────────────────────────────────────────────────────────
const rootEl = document.getElementById('root');
if (!rootEl) {
  // مشكلة في الـ HTML نفسه — نادر جداً
  document.body.innerHTML = `
    <div style="font-family:sans-serif;text-align:center;padding:40px;background:#080d1a;color:#D4AF37;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <p style="font-size:1.2rem">خطأ في تحميل التطبيق</p>
      <button onclick="location.reload()" style="margin-top:16px;background:#D4AF37;color:#080d1a;border:none;padding:10px 24px;border-radius:8px;font-size:16px;cursor:pointer">
        إعادة المحاولة
      </button>
    </div>`;
} else {
  dbg('▶ Mounting React');
  try {
    ReactDOM.createRoot(rootEl).render(
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    );
    dbg('✓ React mounted successfully');
  } catch (err) {
    console.error('[Khatwa] React mount failed:', err);
    rootEl.innerHTML = `
      <div style="font-family:sans-serif;text-align:center;padding:40px;background:#080d1a;color:#D4AF37;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <p style="font-size:1.2rem">حدث خطأ في تشغيل التطبيق</p>
        <p style="font-size:0.8rem;color:rgba(212,175,55,0.5);margin-top:8px">${err?.message || ''}</p>
        <button onclick="caches.keys().then(k=>Promise.all(k.map(c=>caches.delete(c)))).then(()=>location.reload())" style="margin-top:16px;background:#D4AF37;color:#080d1a;border:none;padding:10px 24px;border-radius:8px;font-size:16px;cursor:pointer">
          مسح الكاش وإعادة المحاولة
        </button>
      </div>`;
  }
}