import { useState, useEffect } from "react";
import {
  getCachedWithTimestamps,
  setCached,
  getCacheKey,
  fetchTimestamps,
  timestampsChanged,
  type Timestamps,
} from "@/lib/cache";

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
      try {
        // Get cached data with timestamps
        const cached = getCachedWithTimestamps<T>(cacheKey, ttl);

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
          setError(err instanceof Error ? err : new Error("Failed to validate cache"));
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
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch"));
          setIsLoading(false);
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
