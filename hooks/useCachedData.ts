import { useState, useEffect } from "react";
import {
  getCachedWithTimestamps,
  setCached,
  getCacheKey,
  fetchTimestamps,
  timestampsChanged,
  type Timestamps,
} from "@/lib/cache";
import { db } from "@/lib/offline-db";

interface UseCachedDataOptions {
  ttl?: number;
  enabled?: boolean;
  apiKey?: string;
}

export function useCachedData<T>(
  key: string | string[],
  fetcher: () => Promise<T>,
  options: UseCachedDataOptions = {}
) {
  const { ttl, enabled = true, apiKey } = options;
  const cacheKey = Array.isArray(key) ? getCacheKey(...key) : getCacheKey(key);

  const [data, setData] = useState<T | null>(() => {
    // Try to load from cache immediately for instant display
    if (enabled) {
      const cached = getCachedWithTimestamps<T>(cacheKey, ttl);
      return cached?.data ?? null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function validate() {
      let seededFromIDB = false;

      try {
        // Get cached data with timestamps
        const cached = getCachedWithTimestamps<T>(cacheKey, ttl);

        // If localStorage is empty (e.g. iOS cleared it on restart), seed from IndexedDB
        // so the user sees stale data immediately while we revalidate in the background
        if (!cached) {
          const offline = await db.metadata.get(cacheKey).catch(() => null);
          if (offline && !cancelled) {
            setData(offline.value as T);
            setIsLoading(false);
            seededFromIDB = true;
          }
        }

        // Fetch current server timestamps
        const currentTimestamps = await fetchTimestamps(apiKey);

        // If no server timestamps available, fall back to fetching data
        if (!currentTimestamps) {
          await fetchData(null);
          return;
        }

        // If we have cached data and timestamps haven't changed, we're done
        if (cached && !timestampsChanged(cached.serverTimestamps, currentTimestamps)) {
          if (!cancelled) {
            setData(cached.data);
            setIsLoading(false);
            setError(null);
          }
          return;
        }

        // Timestamps changed or no cache - fetch fresh data
        await fetchData(currentTimestamps);
      } catch (err) {
        if (!cancelled) {
          // If we already seeded from IndexedDB, keep showing that data rather than an error
          if (!seededFromIDB) {
            setError(err instanceof Error ? err : new Error("Failed to validate cache"));
          }
          setIsLoading(false);
        }
      }
    }

    async function fetchData(timestamps: Timestamps | null) {
      try {
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
          setCached(cacheKey, result, timestamps ?? undefined);
          // Write-through to IndexedDB for offline fallback
          db.metadata.put({ key: cacheKey, value: result }).catch(() => {});
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        // Offline fallback: try IndexedDB if network failed
        if (!cancelled) {
          const offline = await db.metadata.get(cacheKey).catch(() => null);
          if (offline) {
            setData(offline.value as T);
            setIsLoading(false);
            setError(null);
          } else {
            setError(err instanceof Error ? err : new Error("Failed to fetch"));
            setIsLoading(false);
          }
        }
      }
    }

    // Always validate on mount
    validate();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, enabled, apiKey, ttl]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, isLoading, error };
}
