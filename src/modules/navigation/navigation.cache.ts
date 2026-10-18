interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class NavigationCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTtlMs: number;

  constructor(ttlSeconds: number = 300) {
    this.defaultTtlMs = ttlSeconds * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidateMenu(menuKey: string): void {
    const prefix = `menu:${menuKey}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix) || key === `menu:${menuKey}` || key === 'menus:all') {
        this.cache.delete(key);
      }
    }
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

export const navigationCache = new NavigationCache(300);
