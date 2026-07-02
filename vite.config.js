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
    // تحديد الأجهزة المتوافقة لضمان عمل المنصة على تابلتات وموبايلات الطلاب القديمة والحديثة
    target: ["es2015", "chrome80", "firefox78", "safari13"],

    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",

        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor-react";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-ui";
            }
            return "vendor-utils";
          }
        },
      },
    },

    // ✅ حذفنا كلمة terser و esbuild وسيبناها بدون تحديد عشان يعتمد على الـ Compiler الافتراضي والآمن لـ Vite 8
    sourcemap: false,
  },


  server: {
    host: "::",
    port: 3000,
  },
});