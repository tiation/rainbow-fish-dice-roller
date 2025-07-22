module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,gif,svg,woff2,mp3,wav,ogg}'
  ],
  swDest: 'dist/sw.js',
  swSrc: 'public/sw.js',
  mode: 'production',
  
  // Runtime caching
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets'
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        cacheableResponse: {
          statuses: [0, 200]
        },
        expiration: {
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          maxEntries: 30
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|gif|svg|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg|m4a)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
        }
      }
    }
  ],

  // Skip waiting and clients claim
  skipWaiting: true,
  clientsClaim: true,

  // Ignore URL parameters for caching
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],

  // Exclude files from precaching
  dontCacheBustURLsMatching: /\.\w{8}\./,
  
  // Maximum cache size
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB

  // Clean up old precaches
  cleanupOutdatedCaches: true
};
