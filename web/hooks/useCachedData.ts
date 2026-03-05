import { useState, useEffect } from "react";
import { getCached, setCached, getCacheKey } from "@/lib/cache";

interface UseCachedDataOptions {
  ttl?: number;
  enabled?: boolean;
}

export function useCachedData<T>(
  key: string | string[],
  fetcher: () => Promise<T>,
  options: UseCachedDataOptions = {}
) {
  const { ttl, enabled = true } = options;
  const cacheKey = Array.isArray(key) ? getCacheKey(...key) : getCacheKey(key);

  const [data, setData] = useState<T | null>(() => {
    // Try to load from cache immediately
    if (enabled) {
      return getCached<T>(cacheKey, ttl);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function fetchData() {
      try {
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
          setCached(cacheKey, result);
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

    // If we have cached data, show it but fetch fresh in background
    if (data) {
      setIsLoading(false);
      fetchData(); // background refresh
    } else {
      fetchData();
    }

    return () => {
      cancelled = true;
    };
  }, [cacheKey, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, isLoading, error };
}
