/**
 * localStorage cache utilities for offline-first PWA experience
 * Uses server-side timestamps for precise cache invalidation
 */

export interface Timestamps {
  cameras: string | null;
  films: string | null;
  rolls: string | null;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
  serverTimestamps?: Timestamps;
}

const CACHE_VERSION = 1;
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour (can be longer now with timestamp validation)

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

export function getCachedWithTimestamps<T>(key: string, ttl = DEFAULT_TTL): {
  data: T;
  serverTimestamps: Timestamps;
} | null {
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

    if (!entry.serverTimestamps) {
      return null;
    }

    return {
      data: entry.data,
      serverTimestamps: entry.serverTimestamps,
    };
  } catch (e) {
    console.error("Cache read error:", e);
    return null;
  }
}

export function setCached<T>(
  key: string,
  data: T,
  serverTimestamps?: Timestamps
): void {
  if (typeof window === "undefined") return;

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
      serverTimestamps,
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

/**
 * Fetches current server timestamps for cache validation
 */
export async function fetchTimestamps(
  apiKey?: string
): Promise<Timestamps | null> {
  if (typeof window === "undefined") return null;

  try {
    const headers: HeadersInit = apiKey
      ? { Authorization: `Bearer ${apiKey}` }
      : {};
    const res = await fetch("/api/cache/timestamps", { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch timestamps:", e);
    return null;
  }
}

/**
 * Compares two timestamp objects to see if data has changed
 */
export function timestampsChanged(
  cached: Timestamps,
  current: Timestamps
): boolean {
  return (
    cached.cameras !== current.cameras ||
    cached.films !== current.films ||
    cached.rolls !== current.rolls
  );
}
