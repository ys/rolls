# PWA Offline Support - Implementation Progress

**Branch:** `pwa-offline`
**Status:** 18/20 tasks complete (90%)
**Last Updated:** 2026-03-16

## Progress Summary

### ✅ Completed (All chunks 1-6)

**Chunk 1 & 2 — Foundation**
1. **Task 1:** Removed next-pwa package
2. **Task 2:** Installed dependencies (Dexie + Serwist)
3. **Task 3:** Created IndexedDB schema (`lib/offline-db.ts`)
4. **Task 4:** Created sync queue helpers (`lib/sync-queue.ts`)
5. **Task 5:** Created PWA manifest and icons
6. **Task 6:** Created service worker with Serwist (`public/sw.ts`)
7. **Task 7:** Created Serwist build script (`scripts/generate-sw.js`)

**Chunk 3 — Service Worker Registration**
8. **Task 8:** Added `ServiceWorkerRegistration` client component; wired into `app/layout.tsx`

**Chunk 4 — Offline Read Support**
9. **Task 9:** `useCachedData` — write-through to IndexedDB `metadata` table after each API fetch
10. **Task 10:** `useCachedData` — IndexedDB fallback when network fetch fails
11. **Task 11:** Enhanced `OfflineIndicator` — now also shows sync progress via SW `SYNC_STATUS` messages

**Chunk 5 — Offline Write + Sync**
12. **Task 12:** Background sync (`syncRolls`) implemented in `public/sw.ts` using raw IndexedDB API
13. **Task 13:** `NewRollSheet` offline creation — saves roll with temp UUID to IndexedDB, queues for sync, registers background sync event

**Chunk 6 — Performance Optimizations**
14. **Task 14:** `HomeClient` listens for SW `SYNC_SUCCESS` messages → invalidates cache + refreshes
15. **Task 15:** `Cache-Control: private, max-age=60` on `/api/rolls`, `/api/rolls/home`, `/api/rolls/archive`
16. **Task 16:** `Cache-Control: private, max-age=300` on `/api/cameras` and `/api/films`
17. **Task 17:** "Syncing…" badge on HomeClient for rolls with temp `offline-*` UUIDs

### 🔄 Remaining

18. **Task 18:** Loading skeletons on cameras/films/stats pages
19. **Task 19:** API pagination for rolls (home page infinite scroll)
20. **Task 20:** Final testing + deploy

## Important: Serwist Migration

**We switched from Workbox to Serwist during implementation.**

- `@serwist/next` — Next.js integration (in `dependencies`)
- `@serwist/build` — build-time manifest injection (in `devDependencies`)
- Service worker source: `public/sw.ts` (TypeScript, compiled to `public/sw.js` by `scripts/generate-sw.js`)
- **Note:** `injectManifest` does not bundle node modules — raw IndexedDB API is used in `sw.ts`

## Architecture

**Offline data flow:**
1. Online: API fetch succeeds → write to localStorage (existing) + IndexedDB metadata (new)
2. Offline read: `useCachedData` catches fetch error → reads from `db.metadata.get(cacheKey)`
3. Offline write: `NewRollSheet` catches fetch error + `!navigator.onLine` → saves to `db.rolls` + `sync_queue`; registers `sync-rolls` background sync
4. Sync: SW handles `sync` event → processes `sync_queue` via raw IndexedDB → POSTs to `/api/rolls` → broadcasts `SYNC_SUCCESS` / `SYNC_STATUS` messages

## Key Files

### New Files
- `lib/offline-db.ts` — IndexedDB schema (Dexie)
- `lib/sync-queue.ts` — Sync queue helpers
- `public/manifest.json` — PWA manifest (redundant — `app/manifest.ts` serves `/manifest.webmanifest`)
- `public/icons/icon-*.png` — PWA icons
- `public/sw.ts` — Service worker source (TypeScript, compiled to `public/sw.js`)
- `scripts/generate-sw.js` — Serwist build script
- `components/ServiceWorkerRegistration.tsx` — Client component that registers `/sw.js`

### Modified Files
- `app/layout.tsx` — Added `<ServiceWorkerRegistration />`
- `app/HomeClient.tsx` — Syncing badge + SW message listener
- `hooks/useCachedData.ts` — IndexedDB write-through + offline fallback
- `components/OfflineIndicator.tsx` — Added sync count display via SW messages
- `components/NewRollSheet.tsx` — Offline creation path
- `app/api/rolls/route.ts` — Cache-Control header
- `app/api/rolls/home/route.ts` — Cache-Control header
- `app/api/rolls/archive/route.ts` — Cache-Control header
- `app/api/cameras/route.ts` — Cache-Control header
- `app/api/films/route.ts` — Cache-Control header
- `package.json` — Dependencies, postbuild script
- `next.config.js` — Removed withPWA wrapper

## Next Steps (Tasks 18-20)

**Task 18: Loading skeletons**
- Check `Skeleton.tsx` for existing `CameraListSkeleton`, `FilmListSkeleton`, `StatsSkeleton`
- Add to `/settings/cameras`, `/settings/films`, `/stats` pages

**Task 19: API pagination**
- Add `?limit` and `?offset` to `/api/rolls`
- Update `HomeClient` with infinite scroll

**Task 20: Test + deploy**
- `npm run build` to generate `public/sw.js`
- Deploy to Heroku: `git push heroku pwa-offline:main`

## Reference

- **Design Spec:** `docs/superpowers/specs/2026-03-16-pwa-offline-performance-design.md`
- **Serwist Docs:** https://serwist.pages.dev/
