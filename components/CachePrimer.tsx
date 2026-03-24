"use client";

/**
 * Proactively warms the offline cache for all main pages.
 * Runs once after the service worker is ready, in the background.
 *
 * - Fetches main page URLs so the SW's NetworkFirst handler caches their HTML
 *   (covers server-rendered pages like /cameras, /films, /stats)
 * - Fetches home + archive API data and stores in localStorage + IndexedDB
 *   (covers useCachedData pages so they work offline even before first visit)
 */

import { useEffect } from "react";
import { setCached, fetchTimestamps, getCacheKey } from "@/lib/cache";
import { db } from "@/lib/offline-db";

const PAGES = ["/", "/archive", "/cameras", "/films", "/stats", "/new"];

const API_ENDPOINTS = [
  { cacheKey: getCacheKey("rolls", "home"), url: "/api/rolls/home" },
  { cacheKey: getCacheKey("rolls", "archive"), url: "/api/rolls/archive" },
  { cacheKey: getCacheKey("cameras"), url: "/api/cameras" },
  { cacheKey: getCacheKey("films"), url: "/api/films" },
  { cacheKey: getCacheKey("rolls", "next"), url: "/api/rolls/next" },
];

export default function CachePrimer() {
  useEffect(() => {
    if (!navigator.onLine || process.env.NODE_ENV !== "production") return;

    async function prime() {
      // Wait for the SW to be active so it can intercept and cache page fetches
      await navigator.serviceWorker?.ready;

      // Warm HTML cache for all main pages (fire and forget)
      PAGES.forEach((url) =>
        fetch(url, { credentials: "same-origin" }).catch(() => {})
      );

      // Warm IndexedDB for useCachedData pages (home + archive)
      const timestamps = await fetchTimestamps().catch(() => null);
      for (const { cacheKey, url } of API_ENDPOINTS) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          setCached(cacheKey, data, timestamps ?? undefined);
          db.metadata.put({ key: cacheKey, value: data }).catch(() => {});
        } catch {
          // best-effort — if offline or auth'd out, skip silently
        }
      }
    }

    prime();
  }, []);

  return null;
}
