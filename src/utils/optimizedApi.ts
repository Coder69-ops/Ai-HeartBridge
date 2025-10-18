import { performanceMonitor } from './performance';

// Enhanced cache implementation with TTL and memory management
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 100;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Request deduplication to prevent duplicate API calls
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    const promise = requestFn()
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear() {
    this.pendingRequests.clear();
  }
}

// Enhanced API client with performance optimizations
export class OptimizedAPIClient {
  private cache = new APICache();
  private deduplicator = new RequestDeduplicator();
  private baseURL: string;
  private defaultOptions: RequestInit;

  constructor(baseURL: string = '/api', options: RequestInit = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Cleanup cache periodically
    setInterval(() => this.cache.cleanup(), 60000); // Every minute
  }

  private createCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body || '';
    return `${method}:${url}:${body}`;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit & { 
      enableCache?: boolean; 
      cacheTTL?: number;
      skipDeduplication?: boolean;
    } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const { enableCache = true, cacheTTL, skipDeduplication = false, ...requestOptions } = options;
    
    const finalOptions: RequestInit = {
      ...this.defaultOptions,
      ...requestOptions,
      headers: {
        ...this.defaultOptions.headers,
        ...requestOptions.headers
      }
    };

    const cacheKey = this.createCacheKey(url, finalOptions);
    
    // Check cache for GET requests
    if (finalOptions.method === 'GET' || !finalOptions.method) {
      if (enableCache && this.cache.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        console.log(`Cache hit for ${endpoint}`);
        return cachedData;
      }
    }

    // Performance monitoring
    const measureName = `api-${endpoint}`;
    performanceMonitor.startMeasure(measureName);

    const makeRequest = async (): Promise<T> => {
      try {
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache successful GET requests
        if (enableCache && (finalOptions.method === 'GET' || !finalOptions.method)) {
          this.cache.set(cacheKey, data, cacheTTL);
        }

        return data;
      } catch (error) {
        console.error(`API request failed for ${endpoint}:`, error);
        throw error;
      } finally {
        performanceMonitor.endMeasure(measureName);
      }
    };

    // Use deduplication for GET requests
    if (skipDeduplication || finalOptions.method !== 'GET') {
      return makeRequest();
    }

    return this.deduplicator.deduplicate(cacheKey, makeRequest);
  }

  // HTTP methods with optimizations
  async get<T>(endpoint: string, options?: { enableCache?: boolean; cacheTTL?: number }): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      enableCache: false,
      ...options
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      enableCache: false,
      ...options
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      enableCache: false,
      ...options
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      enableCache: false,
      ...options
    });
  }

  // Batch requests
  async batch<T>(requests: Array<{ endpoint: string; options?: RequestInit }>): Promise<T[]> {
    const measureName = 'api-batch';
    performanceMonitor.startMeasure(measureName);

    try {
      const promises = requests.map(({ endpoint, options }) => 
        this.request<T>(endpoint, { skipDeduplication: true, ...options })
      );
      
      return await Promise.all(promises);
    } finally {
      performanceMonitor.endMeasure(measureName);
    }
  }

  // Prefetch data for better performance
  async prefetch(endpoints: string[]): Promise<void> {
    const promises = endpoints.map(endpoint => 
      this.get(endpoint).catch(error => {
        console.warn(`Prefetch failed for ${endpoint}:`, error);
      })
    );
    
    await Promise.allSettled(promises);
  }

  // Cache management
  clearCache() {
    this.cache.clear();
    this.deduplicator.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size(),
      entries: Array.from((this.cache as any).cache.keys())
    };
  }

  // Background sync for offline support
  async syncOfflineData(offlineData: Array<{ endpoint: string; method: string; data?: any }>) {
    const results = [];
    
    for (const item of offlineData) {
      try {
        const result = await this.request(item.endpoint, {
          method: item.method,
          body: item.data ? JSON.stringify(item.data) : undefined,
          enableCache: false
        });
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error });
      }
    }
    
    return results;
  }
}

// Response transformation utilities
export const transformResponse = {
  // Normalize API responses
  normalize: <T>(data: any): T => {
    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        id: item.id || item._id,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined
      })) as T;
    }
    
    return {
      ...data,
      id: data.id || data._id,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined
    } as T;
  },

  // Paginate results
  paginate: <T>(data: T[], page: number = 1, limit: number = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: data.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
        hasNext: endIndex < data.length,
        hasPrev: startIndex > 0
      }
    };
  }
};

// Create singleton instance
export const apiClient = new OptimizedAPIClient();

// Hooks for React integration
export const useOptimizedAPI = () => {
  return {
    client: apiClient,
    prefetch: apiClient.prefetch.bind(apiClient),
    clearCache: apiClient.clearCache.bind(apiClient),
    getCacheStats: apiClient.getCacheStats.bind(apiClient)
  };
};