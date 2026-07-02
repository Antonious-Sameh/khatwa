import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    // ── vite-plugin-pwa: يولّد Service Worker تلقائياً مع Precache Manifest ──
    // ده بيحل مشكلة الـ stale cache بعد كل deploy لأنه بيضيف content hash
    // لكل ملف في الـ SW، وبيعمل invalidate للكاش القديم تلقائياً
    VitePWA({
      // injectManifest: نستخدم sw.js بتاعنا لكن نضيف له precache manifest تلقائياً
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw.js",

      // في حالة injectManifest، الـ plugin بيحقن precacheAndRoute في الـ SW
      injectManifest: {
        // الملفات اللي هتتحفظ في الكاش مع hashes
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff,woff2}"],
        // حجم أقصى للملف (4MB)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },

      manifest: false, // عندنا manifest.json يدوي

      devOptions: {
        enabled: false, // لا تفعل الـ SW في development
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    // ── هذا هو السبب الرئيسي للـ Crash على بعض الأجهزة ──
    // بدون target، Vite يبني بـ esnext = ES2022 = يقع على Chrome < 88
    // Chrome 87 = Android 10 على تابلتات كثيرة
    // target: chrome80 = يضمن التوافق مع Chrome 80+ (98%+ من الأجهزة الحالية)
    target: ["es2015", "chrome80", "firefox78", "safari13"],

    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // Hashed filenames = كاش صح + invalidation تلقائي
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",

        // ✅ تحويل manualChunks إلى دالة متوافقة تماماً مع Vite 8 / Rolldown
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // تجميع مكتبات React الأساسية
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor-react";
            }
            // تجميع مكتبات واجهة المستخدم UI
            if (id.includes("@radix-ui")) {
              return "vendor-ui";
            }
            // باقي المكتبات المساعدة والأدوات
            return "vendor-utils";
          }
        },
      },
    },

    minify: "terser",

    terserOptions: {
      compress: {
        // ❌ drop_console: true كان بيحذف error logging → crashes صامتة
        // بنحتفظ بـ console.error و console.warn للـ debugging
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
        // console.error و console.warn بيفضلوا
      },
    },

    sourcemap: false,
  },

  server: {
    host: "::",
    port: 3000,
  },
});