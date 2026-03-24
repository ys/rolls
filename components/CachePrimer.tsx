"use client";

/**
 * Proactively warms the offline cache for all main pages.
 * Runs once after the service worker is ready, in the background.
 *
 * - Fetches main page URLs so the SW's NetworkFirst handler caches their HTML
 *   (covers server-rendered pages like /cameras, /films, /stats)
 * - Fetches home + archive API data and stores in localStorage + IndexedDB
 *   (covers useCachedData pages so they work offline even before first visit)
 * - Upserts entity records into db.rolls, db.cameras, db.films so the
 *   structured tables are populated for offline writes
 */

import { useEffect } from "react";
import { setCached, fetchTimestamps, getCacheKey } from "@/lib/cache";
import { db } from "@/lib/offline-db";
import type { Roll, Camera, Film } from "@/lib/db";

const PAGES = ["/", "/archive", "/cameras", "/films", "/stats", "/new"];

const API_ENDPOINTS = [
  { cacheKey: getCacheKey("rolls", "home"), url: "/api/rolls/home" },
  { cacheKey: getCacheKey("rolls", "archive"), url: "/api/rolls/archive" },
  { cacheKey: getCacheKey("cameras"), url: "/api/cameras" },
  { cacheKey: getCacheKey("films"), url: "/api/films" },
  { cacheKey: getCacheKey("rolls", "next"), url: "/api/rolls/next" },
];

const ROLL_BASE_FIELDS: (keyof Roll)[] = [
  "uuid", "roll_number", "user_id", "camera_uuid", "film_uuid",
  "loaded_at", "shot_at", "fridge_at", "lab_at", "lab_name",
  "scanned_at", "processed_at", "uploaded_at", "archived_at",
  "album_name", "tags", "notes", "contact_sheet_url", "push_pull",
];

function extractRollBase(row: Record<string, unknown>): Roll {
  const out: Partial<Roll> = {};
  for (const field of ROLL_BASE_FIELDS) {
    (out as Record<string, unknown>)[field] = row[field] ?? null;
  }
  return out as Roll;
}

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

          // Seed entity tables for offline writes
          if (url === "/api/rolls/home" || url === "/api/rolls/archive") {
            const rows = (data?.rolls ?? []) as Record<string, unknown>[];
            const records = rows
              .map(extractRollBase)
              .filter((r) => !r.uuid?.startsWith("offline-"));
            if (records.length > 0) db.rolls.bulkPut(records).catch(() => {});
            // Pre-fetch each roll's detail page so SW caches the HTML for offline viewing
            rows.forEach((r) => {
              if (r.roll_number) fetch(`/roll/${r.roll_number}`, { credentials: "same-origin" }).catch(() => {});
            });
          } else if (url === "/api/cameras") {
            const records = (data as Camera[]) ?? [];
            if (records.length > 0) db.cameras.bulkPut(records).catch(() => {});
          } else if (url === "/api/films") {
            const records = (data as Film[]) ?? [];
            if (records.length > 0) db.films.bulkPut(records).catch(() => {});
          }
        } catch {
          // best-effort — if offline or auth'd out, skip silently
        }
      }
    }

    prime();
  }, []);

  return null;
}
