import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // generateSW: Workbox تكتب الـ SW بالكامل تلقائياً
      // مضمونة 100% على كل الأجهزة — لا ES modules، لا import syntax
      strategies: "generateSW",
      registerType: "autoUpdate",

      // الـ SW يتحدث فوراً بدون انتظار
      injectRegister: false, // بنسجله يدوياً في index.html

      workbox: {
        // كل الملفات اللي هتتحفظ في الكاش مع hashes
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        globIgnores: ["**/node_modules/**"],

        // Navigation fallback → الـ SPA يشتغل على أي URL
        navigateFallback: "/",
        navigateFallbackDenylist: [/^\/api\//],

        // لا تخزن API calls
        runtimeCaching: [
          // Google Docs Viewer (PDF عرض)
          {
            urlPattern: /^https:\/\/docs\.google\.com\//,
            handler: "NetworkOnly",
          },
          // Cloudinary images
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "cloudinary-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // API calls — never cache
          {
            urlPattern: /\/api\//,
            handler: "NetworkOnly",
          },
        ],

        // حجم أقصى للملف في الكاش (4MB)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,

        // skipWaiting + clientsClaim = تفعيل فوري
        skipWaiting: true,
        clientsClaim: true,

        // تنظيف الكاش القديم تلقائياً
        cleanupOutdatedCaches: true,
      },

      manifest: {
        name: "منصة خطوة التعليمية",
        short_name: "خطوة",
        description: "منصة خطوة التعليمية — دراسات اجتماعية وتاريخ",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#080d1a",
        theme_color: "#080d1a",
        lang: "ar",
        dir: "rtl",
        icons: [
          { src: "/icons/icon-72x72.png",            sizes: "72x72",   type: "image/png", purpose: "any" },
          { src: "/icons/icon-96x96.png",            sizes: "96x96",   type: "image/png", purpose: "any" },
          { src: "/icons/icon-128x128.png",          sizes: "128x128", type: "image/png", purpose: "any" },
          { src: "/icons/icon-144x144.png",          sizes: "144x144", type: "image/png", purpose: "any" },
          { src: "/icons/icon-152x152.png",          sizes: "152x152", type: "image/png", purpose: "any" },
          { src: "/icons/icon-180x180.png",          sizes: "180x180", type: "image/png", purpose: "any" },
          { src: "/icons/icon-192x192.png",          sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-192x192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/icon-384x384.png",          sizes: "384x384", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512x512.png",          sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512x512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },

      devOptions: {
        enabled: false, // لا SW في dev
      },
    }),
  ],

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },

  build: {
    // الأهم: target واضح لضمان التوافق مع Chrome 80+
    // بدونه Vite يبني ESNext = يقع على Android Chrome < 88
    target: ["es2015", "chrome80", "firefox78", "safari13"],

    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/axios') || id.includes('node_modules/sonner') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
            return 'vendor-utils';
          }
        },
      },
    },

    minify: "terser",
    terserOptions: {
      compress: {
        drop_debugger: true,
        // نحافظ على console.error و console.warn للـ debugging
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
    },
    sourcemap: false,
  },

  server: {
    host: "::",
    port: 3000,
  },
});