import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          vendor: ['howler', 'lottie-web', 'idb', 'workbox-window']
        }
      }
    }
  },
  server: {
    port: 3002,
    host: true,
    open: true
  },
  preview: {
    port: 3002,
    host: true
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3,wav,ogg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}?v=1`;
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Rainbow Fish Dice Roller',
        short_name: 'RainbowDice',
        description: 'Enterprise-grade rainbow fish themed dice rolling PWA with animations and sound effects',
        theme_color: '#16537e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: './',
        scope: './',
        categories: ['games', 'entertainment', 'utilities'],
        lang: 'en-US',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ],
        shortcuts: [
          {
            name: 'Quick Roll',
            short_name: 'Roll',
            description: 'Quickly roll a six-sided die',
            url: './?action=quick-roll',
            icons: [
              {
                src: 'shortcut-roll.png',
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          $rainbow-primary: #16537e;
          $rainbow-secondary: #0f4c75;
          $rainbow-accent: #3282b8;
          $rainbow-background: #1a1a2e;
          $rainbow-surface: #16213e;
          $rainbow-text: #e94560;
          $rainbow-text-light: #ffffff;
          $rainbow-success: #4caf50;
          $rainbow-warning: #ff9800;
          $rainbow-error: #f44336;
        `
      }
    }
  }
});
