import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Precache all build files
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches
cleanupOutdatedCaches();

// Cache Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' ||
               url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [{
      cacheKeyWillBeUsed: async ({ request }) => {
        return `${request.url}?v=1`;
      }
    }]
  })
);

// Cache images and audio files
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'audio',
  new CacheFirst({
    cacheName: 'media',
    plugins: [{
      cacheWillUpdate: async ({ response }) => {
        return response.status === 200 ? response : null;
      }
    }]
  })
);

// Cache API requests with stale-while-revalidate strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache'
  })
);

// Handle background sync for storing dice rolls when offline
self.addEventListener('sync', event => {
  if (event.tag === 'dice-roll-sync') {
    event.waitUntil(syncDiceRolls());
  }
});

// Push notification handling for critical game events
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const { title, body, icon, badge, tag } = data;

  const options = {
    body,
    icon: icon || '/pwa-192x192.png',
    badge: badge || '/pwa-192x192.png',
    tag: tag || 'default',
    data: data,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ],
    vibrate: [100, 50, 100],
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for dice rolls when coming back online
async function syncDiceRolls() {
  try {
    // Open IndexedDB and get pending rolls
    const db = await openIDB();
    const pendingRolls = await getPendingRolls(db);
    
    if (pendingRolls.length > 0) {
      // Sync with server (if implementing server sync)
      for (const roll of pendingRolls) {
        try {
          await syncRollToServer(roll);
          await markRollAsSynced(db, roll.id);
        } catch (error) {
          console.error('Failed to sync roll:', error);
        }
      }
      
      // Notify clients about successful sync
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          syncedCount: pendingRolls.length
        });
      });
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
function openIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RainbowFishDiceDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getPendingRolls(db) {
  const transaction = db.transaction(['rolls'], 'readonly');
  const store = transaction.objectStore('rolls');
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const rolls = request.result.filter(roll => !roll.synced);
      resolve(rolls);
    };
    request.onerror = () => reject(request.error);
  });
}

async function markRollAsSynced(db, rollId) {
  const transaction = db.transaction(['rolls'], 'readwrite');
  const store = transaction.objectStore('rolls');
  const roll = await store.get(rollId);
  
  if (roll) {
    roll.synced = true;
    await store.put(roll);
  }
}

async function syncRollToServer(roll) {
  // Placeholder for server sync functionality
  // In a real implementation, this would send the roll data to a server
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Roll synced to server:', roll);
      resolve();
    }, 100);
  });
}

// Handle messages from the main thread
self.addEventListener('message', event => {
  const { type, data } = event.data;

  switch (type) {
    case 'CHECK_UPDATE':
      // Force update check
      self.registration.update();
      break;
      
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', data: status });
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const cacheDetails = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    cacheDetails[cacheName] = keys.length;
  }
  
  return {
    totalCaches: cacheNames.length,
    details: cacheDetails
  };
}

// Install event - cache essential resources immediately
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open('rainbow-dice-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/main.js',
        '/src/styles/main.scss',
        '/src/utils/sound.js',
        '/pwa-192x192.png',
        '/pwa-512x512.png'
      ]).catch(error => {
        console.error('Failed to cache resources during install:', error);
      });
    })
  );
  
  // Take control of all pages immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.includes('rainbow-dice') && cacheName !== 'rainbow-dice-v1') {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all pages
      clients.claim()
    ])
  );
});

// Fetch event - serve cached resources when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests (unless they're for Google Fonts)
  const url = new URL(event.request.url);
  const isGoogleFonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  const isSameOrigin = url.origin === location.origin;
  
  if (!isSameOrigin && !isGoogleFonts) return;
  
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version if available
      if (response) {
        return response;
      }
      
      // Otherwise, fetch from network
      return fetch(event.request).then(networkResponse => {
        // Cache successful responses
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open('rainbow-dice-v1').then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return networkResponse;
      }).catch(error => {
        console.error('Fetch failed:', error);
        
        // Return offline fallback for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        
        throw error;
      });
    })
  );
});
