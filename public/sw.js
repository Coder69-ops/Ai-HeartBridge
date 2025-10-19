// Simple Service Worker for AI HeartBridge
const CACHE_NAME = 'heartbridge-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple network-first strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});

console.log('Service Worker: Loaded');