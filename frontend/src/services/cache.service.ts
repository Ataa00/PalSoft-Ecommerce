/**
 * Cache Service
 * Implements caching strategies for API calls and data management
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

class CacheService {
  private memoryCache = new Map<string, CacheItem<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;

  constructor() {
    // Clean up expired items periodically
    setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute
  }

  /**
   * Get item from cache
   */
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const storage = options.storage || 'memory';

    try {
      let item: CacheItem<T> | null = null;

      switch (storage) {
        case 'memory':
          const memoryItem = this.memoryCache.get(key);
          item = memoryItem ? (memoryItem as CacheItem<T>) : null;
          break;
        case 'localStorage':
          item = this.getFromStorage(key, localStorage);
          break;
        case 'sessionStorage':
          item = this.getFromStorage(key, sessionStorage);
          break;
      }

      if (!item) {
        return null;
      }

      // Check if expired
      if (Date.now() > item.expiresAt) {
        this.delete(key, options);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const storage = options.storage || 'memory';
    const ttl = options.ttl || this.defaultTTL;
    const maxSize = options.maxSize || this.maxSize;

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      key
    };

    try {
      switch (storage) {
        case 'memory':
          // Check size limit
          if (this.memoryCache.size >= maxSize) {
            this.evictOldest();
          }
          this.memoryCache.set(key, item as CacheItem<unknown>);
          break;
        case 'localStorage':
          this.setToStorage(key, item, localStorage);
          break;
        case 'sessionStorage':
          this.setToStorage(key, item, sessionStorage);
          break;
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete item from cache
   */
  delete(key: string, options: CacheOptions = {}): void {
    const storage = options.storage || 'memory';

    try {
      switch (storage) {
        case 'memory':
          this.memoryCache.delete(key);
          break;
        case 'localStorage':
          localStorage.removeItem(`cache_${key}`);
          break;
        case 'sessionStorage':
          sessionStorage.removeItem(`cache_${key}`);
          break;
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache
   */
  clear(options: CacheOptions = {}): void {
    const storage = options.storage || 'memory';

    try {
      switch (storage) {
        case 'memory':
          this.memoryCache.clear();
          break;
        case 'localStorage':
          this.clearStorage(localStorage);
          break;
        case 'sessionStorage':
          this.clearStorage(sessionStorage);
          break;
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Check if key exists in cache
   */
  has(key: string, options: CacheOptions = {}): boolean {
    return this.get(key, options) !== null;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memorySize = this.memoryCache.size;
    const memoryKeys = Array.from(this.memoryCache.keys());
    
    return {
      memory: {
        size: memorySize,
        keys: memoryKeys,
        maxSize: this.maxSize
      },
      localStorage: this.getStorageStats(localStorage),
      sessionStorage: this.getStorageStats(sessionStorage)
    };
  }

  /**
   * Memoize function with caching
   */
  memoize<T extends (...args: unknown[]) => unknown>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    options: CacheOptions = {}
  ): T {
    const cache = new Map<string, { result: ReturnType<T>; timestamp: number }>();
    const ttl = options.ttl || this.defaultTTL;

    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const cached = cache.get(key);

      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.result;
      }

      const result = fn(...args) as ReturnType<T>;
      cache.set(key, { result, timestamp: Date.now() });

      return result;
    }) as T;
  }

  /**
   * Cache API response with automatic invalidation
   */
  async cacheApiCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Make API call and cache result
    try {
      const result = await apiCall();
      this.set(key, result, options);
      return result;
    } catch (error) {
      // Don't cache errors, just throw
      throw error;
    }
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string, options: CacheOptions = {}): void {
    const storage = options.storage || 'memory';

    try {
      switch (storage) {
        case 'memory':
          const keysToDelete = Array.from(this.memoryCache.keys())
            .filter(key => key.includes(pattern));
          keysToDelete.forEach(key => this.memoryCache.delete(key));
          break;
        case 'localStorage':
          this.invalidateStoragePattern(pattern, localStorage);
          break;
        case 'sessionStorage':
          this.invalidateStoragePattern(pattern, sessionStorage);
          break;
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }

  // Private methods

  private getFromStorage<T>(key: string, storage: Storage): CacheItem<T> | null {
    try {
      const item = storage.getItem(`cache_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private setToStorage<T>(key: string, item: CacheItem<T>, storage: Storage): void {
    try {
      storage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch {
      // Handle storage quota exceeded
      console.warn('Storage quota exceeded, clearing old cache items');
      this.clearOldStorageItems(storage);
      try {
        storage.setItem(`cache_${key}`, JSON.stringify(item));
      } catch {
        // Still can't store, give up
        console.error('Unable to store in cache after cleanup');
      }
    }
  }

  private clearStorage(storage: Storage): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  private clearOldStorageItems(storage: Storage): void {
    const items: { key: string; timestamp: number }[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const item = JSON.parse(storage.getItem(key) || '{}');
          items.push({ key, timestamp: item.timestamp || 0 });
        } catch {
          // Invalid item, mark for removal
          items.push({ key, timestamp: 0 });
        }
      }
    }

    // Sort by timestamp and remove oldest 50%
    items.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = items.slice(0, Math.floor(items.length / 2));
    toRemove.forEach(item => storage.removeItem(item.key));
  }

  private getStorageStats(storage: Storage) {
    let cacheItems = 0;
    let totalSize = 0;

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('cache_')) {
        cacheItems++;
        const value = storage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
    }

    return { items: cacheItems, size: totalSize };
  }

  private invalidateStoragePattern(pattern: string, storage: Storage): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('cache_') && key.includes(pattern)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  private evictOldest(): void {
    if (this.memoryCache.size === 0) return;

    let oldestKey = '';
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.memoryCache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.memoryCache.delete(key));
  }
}

// Export singleton instance
const cacheServiceInstance = new CacheService();
export default cacheServiceInstance;
