// Offline Data Management for PWA
// Handles data caching, synchronization, and offline functionality

interface StorageItem {
  id: string;
  data: any;
  timestamp: number;
  synced: boolean;
  type: 'journal' | 'exercise' | 'checkin' | 'profile';
}

interface SyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  type: string;
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineManager {
  private dbName = 'HeartBridgeOffline';
  private version = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  // Initialize IndexedDB
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('data')) {
          const dataStore = db.createObjectStore('data', { keyPath: 'id' });
          dataStore.createIndex('type', 'type', { unique: false });
          dataStore.createIndex('timestamp', 'timestamp', { unique: false });
          dataStore.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  // Store data offline
  async storeData(id: string, data: any, type: StorageItem['type'], synced = false): Promise<void> {
    if (!this.db) await this.initDB();

    const item: StorageItem = {
      id,
      data,
      timestamp: Date.now(),
      synced,
      type
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Retrieve data from offline storage
  async getData(id: string): Promise<StorageItem | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all data of specific type
  async getDataByType(type: StorageItem['type']): Promise<StorageItem[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Add item to sync queue
  async addToSyncQueue(action: SyncQueue['action'], type: string, data: any): Promise<void> {
    if (!this.db) await this.initDB();

    const queueItem: SyncQueue = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      type,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.put(queueItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get sync queue
  async getSyncQueue(): Promise<SyncQueue[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove from sync queue
  async removeFromSyncQueue(id: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cache API responses
  async cacheResponse(key: string, data: any, ttl = 3600000): Promise<void> { // Default 1 hour TTL
    if (!this.db) await this.initDB();

    const cacheItem = {
      key,
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(cacheItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached response
  async getCachedResponse(key: string): Promise<any | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiry > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear expired cache
  async clearExpiredCache(): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiry');
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Sync data when online
  async syncData(): Promise<void> {
    if (!navigator.onLine) return;

    const queue = await this.getSyncQueue();
    const maxRetries = 3;

    for (const item of queue) {
      try {
        await this.syncQueueItem(item);
        await this.removeFromSyncQueue(item.id);
      } catch (error) {
        console.error('Sync failed for item:', item, error);
        
        // Increment retry count
        if (item.retries < maxRetries) {
          item.retries++;
          // Re-add to queue with updated retry count
          const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
          const store = transaction.objectStore('syncQueue');
          store.put(item);
        } else {
          // Remove failed items after max retries
          await this.removeFromSyncQueue(item.id);
        }
      }
    }
  }

  private async syncQueueItem(item: SyncQueue): Promise<void> {
    // This would integrate with your API client
    const endpoint = this.getEndpointForType(item.type);
    
    switch (item.action) {
      case 'create':
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        break;
      case 'update':
        await fetch(`${endpoint}/${item.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        break;
      case 'delete':
        await fetch(`${endpoint}/${item.data.id}`, {
          method: 'DELETE'
        });
        break;
    }
  }

  private getEndpointForType(type: string): string {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.heartbridge.app'
      : 'http://localhost:3001/api';
    
    const endpoints: Record<string, string> = {
      journal: `${baseUrl}/journals`,
      exercise: `${baseUrl}/exercises`,
      checkin: `${baseUrl}/checkins`,
      profile: `${baseUrl}/users`
    };

    return endpoints[type] || `${baseUrl}/${type}`;
  }

  // Get storage usage
  async getStorageInfo(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0
      };
    }
    return { used: 0, available: 0 };
  }

  // Clear all offline data
  async clearAllData(): Promise<void> {
    if (!this.db) await this.initDB();

    const stores = ['data', 'syncQueue', 'cache'];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(stores, 'readwrite');
      let completed = 0;

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          completed++;
          if (completed === stores.length) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  // Export data for backup
  async exportData(): Promise<any> {
    const allData = await this.getDataByType('journal');
    const exercises = await this.getDataByType('exercise');
    const checkins = await this.getDataByType('checkin');
    const profile = await this.getDataByType('profile');

    return {
      timestamp: Date.now(),
      data: {
        journals: allData,
        exercises,
        checkins,
        profile
      }
    };
  }
}

// Network status manager
class NetworkManager {
  private static instance: NetworkManager;
  private callbacks: Array<(online: boolean) => void> = [];
  private isOnline = navigator.onLine;

  private constructor() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private handleOnline() {
    this.isOnline = true;
    this.notifyCallbacks(true);
    
    // Trigger sync when coming back online
    const offlineManager = new OfflineManager();
    offlineManager.syncData();
  }

  private handleOffline() {
    this.isOnline = false;
    this.notifyCallbacks(false);
  }

  private notifyCallbacks(online: boolean) {
    this.callbacks.forEach(callback => callback(online));
  }

  public addStatusListener(callback: (online: boolean) => void) {
    this.callbacks.push(callback);
    // Immediately call with current status
    callback(this.isOnline);
  }

  public removeStatusListener(callback: (online: boolean) => void) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  public getStatus(): boolean {
    return this.isOnline;
  }

  // Test network connectivity
  public async testConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Push notification manager
class NotificationManager {
  private registration: ServiceWorkerRegistration | null = null;

  async initialize(): Promise<void> {
    if ('serviceWorker' in navigator) {
      this.registration = await navigator.serviceWorker.ready;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) return null;

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        ) as BufferSource
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async showLocalNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icons/heart-bridge-192.png',
        badge: '/icons/heart-bridge-96.png',
        ...options
      });
    }
  }
}

// Export singleton instances
export const offlineManager = new OfflineManager();
export const networkManager = NetworkManager.getInstance();
export const notificationManager = new NotificationManager();

export { OfflineManager, NetworkManager, NotificationManager };
export type { StorageItem, SyncQueue };