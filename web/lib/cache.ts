/**
 * localStorage cache utilities for offline-first PWA experience
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

const CACHE_VERSION = 1;
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

export function getCached<T>(key: string, ttl = DEFAULT_TTL): T | null {
  if (typeof window === "undefined") return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);

    // Version mismatch - invalidate
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    // Expired - invalidate
    const age = Date.now() - entry.timestamp;
    if (age > ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (e) {
    console.error("Cache read error:", e);
    return null;
  }
}

export function setCached<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    console.error("Cache write error:", e);
  }
}

export function invalidateCache(pattern?: string): void {
  if (typeof window === "undefined") return;

  try {
    if (!pattern) {
      // Clear all cache entries with our version
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("cache:")) {
          localStorage.removeItem(key);
        }
      });
    } else {
      // Clear matching pattern
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (e) {
    console.error("Cache invalidation error:", e);
  }
}

export function getCacheKey(...parts: string[]): string {
  return `cache:${parts.join(":")}`;
}
