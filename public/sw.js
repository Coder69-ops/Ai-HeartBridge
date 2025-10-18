// AI HeartBridge Service Worker
// Provides offline functionality, caching, and push notifications

const CACHE_NAME = 'heartbridge-v1';
const STATIC_CACHE_NAME = 'heartbridge-static-v1';
const DYNAMIC_CACHE_NAME = 'heartbridge-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/heart-bridge-192.png',
  '/icons/heart-bridge-512.png',
  // Add your critical CSS and JS files here
];

// Routes that should work offline
const OFFLINE_PAGES = [
  '/',
  '/dashboard',
  '/profile'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('HeartBridge Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('HeartBridge Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('HeartBridge Service Worker: Static assets cached');
        return self.skipWaiting(); // Force activation
      })
      .catch((error) => {
        console.error('HeartBridge Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('HeartBridge Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('HeartBridge Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('HeartBridge Service Worker: Activated');
        return self.clients.claim(); // Take control of all clients
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script') {
    event.respondWith(handleStaticAssets(request));
    return;
  }

  // Handle navigation requests
  if (request.destination === 'document') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default: network first, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          // Cache successful responses
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request);
      })
  );
});

// Handle API requests - network first with offline fallback
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful API responses for offline use
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('HeartBridge Service Worker: API request failed, checking cache');
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline message for API calls
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires an internet connection'
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// Handle static assets - cache first
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('HeartBridge Service Worker: Failed to fetch static asset:', request.url);
    
    // Return a fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="200" fill="#f3f4f6"/><text x="150" y="100" text-anchor="middle" fill="#6b7280">Image unavailable offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache the page
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('HeartBridge Service Worker: Navigation request failed, checking cache');
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to cached home page for SPA routing
    const homeCache = await caches.match('/');
    if (homeCache) {
      return homeCache;
    }
    
    // Final fallback - offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HeartBridge - Offline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          .heart {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: pulse 2s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          h1 { margin: 0 0 1rem 0; }
          p { margin: 0.5rem 0; opacity: 0.9; }
          button {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            cursor: pointer;
            font-size: 1rem;
            margin-top: 1rem;
            transition: all 0.3s ease;
          }
          button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="heart">💙</div>
          <h1>HeartBridge</h1>
          <p>You're currently offline</p>
          <p>Please check your internet connection and try again</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html'
      }
    });
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('HeartBridge Service Worker: Push notification received');
  
  const options = {
    body: 'Your partner has shared something special with you.',
    icon: '/icons/heart-bridge-192.png',
    badge: '/icons/heart-bridge-96.png',
    vibrate: [200, 100, 200],
    tag: 'heartbridge-notification',
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'View Message',
        icon: '/icons/heart-bridge-96.png'
      },
      {
        action: 'close',
        title: 'Later',
        icon: '/icons/heart-bridge-96.png'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.data = { ...options.data, ...data };
    } catch (e) {
      console.log('Failed to parse push notification data');
    }
  }

  event.waitUntil(
    self.registration.showNotification('HeartBridge', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('HeartBridge Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync event (for offline actions)
self.addEventListener('sync', (event) => {
  console.log('HeartBridge Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any pending offline actions here
      handleBackgroundSync()
    );
  }
});

async function handleBackgroundSync() {
  console.log('HeartBridge Service Worker: Processing background sync');
  
  // Implement offline action processing here
  // For example: sync journal entries, exercise completions, etc.
  
  try {
    // Example: Sync pending journal entries
    const pendingEntries = await getPendingJournalEntries();
    
    for (const entry of pendingEntries) {
      await syncJournalEntry(entry);
    }
    
    console.log('HeartBridge Service Worker: Background sync completed');
  } catch (error) {
    console.error('HeartBridge Service Worker: Background sync failed', error);
  }
}

// Helper functions for offline data management
async function getPendingJournalEntries() {
  // Implement logic to retrieve pending entries from IndexedDB
  return [];
}

async function syncJournalEntry(entry) {
  // Implement logic to sync entry with server
  console.log('Syncing entry:', entry);
}

// Handle app updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('HeartBridge Service Worker: Loaded successfully');