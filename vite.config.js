import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',          // we handle registration + prompt ourselves
      injectRegister: null,            // don't auto-inject — we do it in main.jsx
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-icon-*.svg', 'images/**/*'],
      manifest: {
        name: 'Awra Finishing & Interior',
        short_name: 'Awra Designs',
        description: 'Professional architectural design, interior planning, finishing work, and branding services in Addis Ababa, Ethiopia.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/pwa-icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/pwa-icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: '/pwa-icon-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
          { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,png,svg,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
      devOptions: {
        enabled: true,          // enables SW in dev so the install prompt fires
        type: 'module',
      },
    }),
  ],
  server: {
    host: true,
    open: true,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor'
            }
            if (id.includes('react-intersection-observer')) {
              return 'observer-vendor'
            }
            // Other vendor libraries
            return 'vendor'
          }
          // Component chunks for better code splitting
          if (id.includes('/components/')) {
            const componentName = id.split('/components/')[1]?.split('/')[0]
            if (componentName && ['Portfolio', 'Blog', 'Testimonials'].includes(componentName)) {
              return `component-${componentName.toLowerCase()}`
            }
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          return `assets/[ext]/[name]-[hash][extname]`
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Reduce asset inlining threshold
    assetsInlineLimit: 4096
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'react-intersection-observer']
  }
})
