// Simple service worker for PWA installability
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // Just pass through requests
});
