# PWA Offline Support - Implementation Progress

**Branch:** `pwa-offline`
**Status:** 7/20 tasks complete (35%)
**Last Updated:** 2026-03-16

## Progress Summary

### ✅ Completed (Chunk 1 & 2)

1. **Task 1:** Removed next-pwa package
2. **Task 2:** Installed dependencies (Dexie + **Serwist**)
3. **Task 3:** Created IndexedDB schema (`lib/offline-db.ts`)
4. **Task 4:** Created sync queue helpers (`lib/sync-queue.ts`)
5. **Task 5:** Created PWA manifest and icons
6. **Task 6:** Created service worker with **Serwist** (`public/sw.ts`)
7. **Task 7:** Created Serwist build script (`scripts/generate-sw.js`)

### 🔄 Next: Chunk 3 - Service Worker Registration

8. **Task 8:** Register service worker in app layout
9. (Continue with Tasks 9-20 per plan)

## Important: Serwist Migration

**We switched from Workbox to Serwist during implementation.**

### Why?
- Workbox development has slowed (last major release 2+ years ago)
- Serwist is an actively maintained fork with better Next.js integration
- Native TypeScript support (no need for separate type definitions)
- Compatible API made migration easy at this early stage

### What Changed?

**Dependencies (Task 2):**
```json
{
  "dependencies": {
    "dexie": "^4.3.0",
    "@serwist/next": "^9.5.7"
  },
  "devDependencies": {
    "@serwist/build": "^9.5.7"
  }
}
```

**Service Worker (Task 6):**
- File: `public/sw.ts` (TypeScript, not JavaScript)
- Uses Serwist API instead of Workbox
- See commit `3f25662` for implementation

**Build Script (Task 7):**
- Uses `@serwist/build` instead of `workbox-build`
- Compiles TypeScript service worker to JavaScript
- See commit `6b453da` for implementation

### Plan Document Note

The original plan (`docs/superpowers/plans/2026-03-16-pwa-offline-performance.md`) references Workbox in code examples. **Ignore Workbox references** and use the Serwist patterns established in commits `3f25662` and `6b453da` instead.

## Key Files

### New Files Created
- `lib/offline-db.ts` - IndexedDB schema (Dexie)
- `lib/sync-queue.ts` - Sync queue helpers
- `public/manifest.json` - PWA manifest
- `public/icons/icon-*.png` - PWA icons
- `public/sw.ts` - Service worker source (TypeScript)
- `scripts/generate-sw.js` - Build script

### Modified Files
- `package.json` - Dependencies, postbuild script
- `next.config.js` - Removed withPWA wrapper
- `.gitignore` - Added `public/sw.js` (generated file)

### Generated Files (not in git)
- `public/sw.js` - Compiled service worker (generated during build)

## Next Steps

**To continue on another computer:**

1. Checkout branch:
   ```bash
   git checkout pwa-offline
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build to generate service worker:
   ```bash
   npm run build
   ```

4. Start with **Task 8: Register Service Worker in App Layout**
   - File to modify: `app/layout.tsx`
   - Add manifest link: `<link rel="manifest" href="/manifest.json">`
   - Register service worker using `@serwist/next/worker`
   - Add OfflineIndicator component

5. Follow the plan for Tasks 8-20, but use Serwist API instead of Workbox

## Reference Documents

- **Implementation Plan:** `docs/superpowers/plans/2026-03-16-pwa-offline-performance.md`
- **Design Spec:** `docs/superpowers/specs/2026-03-16-pwa-offline-performance-design.md`
- **Serwist Docs:** https://serwist.pages.dev/

## Commits

```
6b453da feat: add Serwist build script for SW generation
3f25662 feat: add Serwist service worker
a2d67e8 feat: add PWA manifest and icons
254c105 feat: add sync queue helpers
85a3600 chore: add fake-indexeddb dev dependency for testing
73d68d9 feat: add IndexedDB schema with Dexie
05dfec3 chore: add dexie and serwist dependencies
f6d2e96 chore: remove next-pwa dependency
```

## Architecture Overview

**Offline Data Layer:**
- IndexedDB (via Dexie) stores: rolls, cameras, films, sync_queue, metadata
- Write-through caching: API responses update IndexedDB
- Read-through with fallback: Try network → fallback to IndexedDB

**Service Worker:**
- Serwist handles caching strategies
- Precaches Next.js static assets (116 files, ~12MB)
- Background sync for offline-created rolls

**Still TODO:**
- IndexedDB write-through integration (Tasks 9-10)
- Offline indicator UI (Task 11)
- Background sync implementation (Task 12)
- Offline roll creation (Task 13)
- Performance optimizations (Tasks 15-18)
