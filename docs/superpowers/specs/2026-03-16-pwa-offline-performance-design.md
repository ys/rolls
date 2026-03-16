# PWA Offline Support + Performance Improvements

> **Goal:** Enable offline viewing and roll creation with background sync, fix cold start performance issues

**Architecture:** IndexedDB for client-side persistence, native Next.js PWA with Workbox, background sync for offline-created rolls

**Tech Stack:** Dexie.js (IndexedDB wrapper), Workbox (service worker), Next.js 16 App Router, existing Postgres backend

---

## Problem Statement

The current PWA has two critical issues:

1. **Offline doesn't work at all** - App fails completely without network connection
2. **Cold start is slow** - Blank screen (first paint) and slow data loading on initial visit

Users need to:
- View existing rolls/cameras/films when offline
- Create new rolls offline (synced later)
- Experience faster initial page loads

## Architecture Overview

### Offline Data Layer

**IndexedDB Schema (via Dexie.js):**
```typescript
// lib/offline-db.ts
class RollsDB extends Dexie {
  rolls!: Table<Roll>;
  cameras!: Table<Camera>;
  films!: Table<Film>;
  sync_queue!: Table<SyncItem>;
  metadata!: Table<{ key: string; value: any }>;

  constructor() {
    super('RollsDB');
    this.version(1).stores({
      rolls: 'uuid, roll_number, user_id',
      cameras: 'uuid, slug, user_id',
      films: 'uuid, slug, user_id',
      sync_queue: '++id, type, timestamp, retries',
      metadata: 'key'
    });
  }
}
```

**Data Flow:**
1. **Online**: API response → update IndexedDB → render UI
2. **Offline**: Check IndexedDB → render UI with stale data indicator
3. **Create offline**: Save to IndexedDB + sync_queue → show "syncing..." badge → sync on reconnect

**Cache Strategy:**
- Write-through: Every successful API fetch updates IndexedDB
- Read-through: Try network first (3s timeout), fallback to IndexedDB
- Store timestamp per collection: `metadata` table tracks last sync time
- Show "Last synced: X minutes ago" in UI when serving stale data

### Service Worker Architecture

**Migration from next-pwa to Native:**
1. Remove `next-pwa` dependency (unmaintained, 2+ years old)
2. Create custom service worker using Workbox directly
3. Use `workbox-build` to generate precache manifest at build time
4. Register SW manually in `app/layout.tsx`

**File Structure:**
```
public/
  sw.js                  # Custom service worker (template)
  manifest.json          # PWA manifest
  icons/
    icon-192x192.png
    icon-512x512.png
scripts/
  generate-sw.js         # Build script: injects Workbox precache manifest
```

**Service Worker Caching Strategies:**
```javascript
// public/sw.js (template before Workbox injection)

// 1. Precache (injected by workbox-build)
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// 2. App Shell (HTML pages) - StaleWhileRevalidate
workbox.routing.registerRoute(
  ({request}) => request.mode === 'navigate',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'app-shell',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  })
);

// 3. API routes - NetworkFirst with IndexedDB fallback
workbox.routing.registerRoute(
  /\/api\/(rolls|cameras|films)/,
  async ({event}) => {
    const networkStrategy = new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 3,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60
        })
      ]
    });

    try {
      const response = await networkStrategy.handle({event});
      // On successful network response, update IndexedDB
      if (response.ok) {
        const data = await response.clone().json();
        await updateIndexedDB(event.request.url, data);
      }
      return response;
    } catch (error) {
      // Network failed, try IndexedDB
      const cachedData = await getFromIndexedDB(event.request.url);
      if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
          headers: { 'Content-Type': 'application/json', 'X-Offline-Cache': 'true' }
        });
      }
      throw error;
    }
  }
);

// 4. Static assets - CacheFirst
workbox.routing.registerRoute(
  /\/_next\/static\/.+$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'next-static',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 256,
        maxAgeSeconds: 365 * 24 * 60 * 60
      })
    ]
  })
);

// 5. Images - CacheFirst
workbox.routing.registerRoute(
  /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 30 * 24 * 60 * 60
      })
    ]
  })
);
```

### Background Sync

**Offline Roll Creation Flow:**
1. User creates roll → `POST /api/rolls` intercepted by SW
2. SW detects offline → save to IndexedDB with temp UUID (`offline-{timestamp}-{random}`)
3. Add to `sync_queue` table: `{type: 'create_roll', data: {...}, timestamp, retries: 0}`
4. Register background sync event: `sw.registration.sync.register('sync-rolls')`
5. Show roll in UI immediately with "Syncing..." badge

**Sync Event Handler:**
```javascript
// In service worker
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-rolls') {
    event.waitUntil(processSyncQueue());
  }
});

async function processSyncQueue() {
  const queue = await db.sync_queue.toArray();

  for (const item of queue) {
    if (item.retries >= 3) {
      // Max retries exceeded, notify user for manual intervention
      await self.registration.showNotification('Sync Failed', {
        body: `Failed to sync roll after 3 attempts. Please check manually.`,
        tag: 'sync-failure',
        requireInteraction: true
      });
      continue;
    }

    try {
      if (item.type === 'create_roll') {
        const response = await fetch('/api/rolls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${item.apiKey}` // stored in sync item
          },
          body: JSON.stringify(item.data)
        });

        if (response.ok) {
          const serverRoll = await response.json();

          // Replace temp UUID with server UUID
          await db.rolls.delete(item.data.uuid); // delete temp
          await db.rolls.add(serverRoll); // add with real UUID
          await db.sync_queue.delete(item.id);

          // Notify client to update UI
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              tempUuid: item.data.uuid,
              serverRoll: serverRoll
            });
          });
        } else {
          // Server rejected, increment retry
          await db.sync_queue.update(item.id, { retries: item.retries + 1 });
        }
      }
    } catch (error) {
      // Network still down or server error, increment retry
      await db.sync_queue.update(item.id, { retries: item.retries + 1 });
    }
  }
}
```

## Performance Optimizations

### 1. App Shell Pre-caching

**Problem:** First paint is slow because Next.js pages aren't cached aggressively

**Solution:**
- Pre-cache critical routes at SW install time
- Use Workbox's precache manifest generation
- Cache Next.js build artifacts (JS bundles, CSS)

**Routes to precache:**
- `/` (home)
- `/archive`
- `/stats`
- `/settings`
- All `/_next/static/*` assets

### 2. Loading Skeletons

**Problem:** White screen while waiting for API data

**Solution:**
- Show skeleton UI immediately (already have `RollSkeleton`)
- Create additional skeletons:
  - `CameraListSkeleton` for `/settings/cameras`
  - `FilmListSkeleton` for `/settings/films`
  - `StatsSkeleton` for `/stats`
- Replace loading spinners with skeletons across all pages

**Example:**
```typescript
// components/Skeleton.tsx
export function CameraListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 p-3 border" style={{borderColor: 'var(--darkroom-border)'}}>
          <div className="h-10 w-10 animate-pulse" style={{background: 'var(--darkroom-border)'}} />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse" style={{background: 'var(--darkroom-border)'}} />
            <div className="h-3 w-24 animate-pulse" style={{background: 'var(--darkroom-border)'}} />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 3. API Pagination

**Problem:** Loading all rolls on home page is slow for users with 300+ rolls

**Solution:**
- Add pagination to `GET /api/rolls`: query params `?limit=50&offset=0`
- Home page: load first 50 rolls immediately
- Infinite scroll: load next 50 when user scrolls to bottom
- Keep archive page as-is (already filtered by `scanned_at`)

**API Route Change:**
```typescript
// app/api/rolls/route.ts
export async function GET(request: NextRequest) {
  const userId = await getUserId();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const rows = await sql<Roll[]>`
    SELECT * FROM rolls
    WHERE user_id = ${userId}
    ORDER BY roll_number DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return NextResponse.json(rows, {
    headers: {
      'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      'X-Total-Count': rows.length < limit ? offset + rows.length : 'unknown'
    }
  });
}
```

### 4. HTTP Cache Headers

**Problem:** API responses aren't cached by browser, every navigation refetches data

**Solution:**
- Add `Cache-Control` headers to GET endpoints:
  - `/api/rolls` → `public, max-age=60` (1 minute)
  - `/api/cameras` → `public, max-age=300` (5 minutes, rarely changes)
  - `/api/films` → `public, max-age=300`
  - `/api/rolls/next` → `no-cache` (always fresh)

### 5. Bundle Optimization

**Current state:** Using `next-pwa@5.x` which is 2+ years old

**Changes:**
- Remove `next-pwa` entirely (migration covered above)
- Add `buildExcludes: [/\.map$/]` to skip caching source maps
- Verify critical CSS is inlined via Next.js default behavior
- No additional bundle size optimizations needed (app is already lean)

## UI Components

### Offline Indicator

**Component:** `components/OfflineIndicator.tsx`

**Behavior:**
- Listen to `window.addEventListener('online')` and `window.addEventListener('offline')`
- Show banner at top of screen when offline: "You're offline. Changes will sync when reconnected."
- Show sync status: "Syncing 2 rolls..." with spinner when `sync` event is active
- Auto-dismiss after successful sync

**Design:**
```typescript
'use client';

import { useEffect, useState } from 'react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncingCount, setSyncingCount] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for SW messages about sync status
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_STATUS') {
        setSyncingCount(event.data.count);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && syncingCount === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm"
      style={{
        backgroundColor: isOnline ? 'var(--accent)' : 'var(--darkroom-border)',
        color: isOnline ? '#000' : 'var(--darkroom-text-primary)'
      }}
    >
      {!isOnline && "You're offline. Changes will sync when reconnected."}
      {isOnline && syncingCount > 0 && `Syncing ${syncingCount} roll${syncingCount > 1 ? 's' : ''}...`}
    </div>
  );
}
```

### Syncing Badge on Rolls

**Location:** `app/HomeClient.tsx` and `app/ArchiveClient.tsx`

**Behavior:**
- Show small "Syncing..." badge on rolls with temp UUIDs (starting with `offline-`)
- Remove badge when SW sends `SYNC_SUCCESS` message

**Visual:**
```typescript
{roll.uuid.startsWith('offline-') && (
  <span
    className="text-xs px-2 py-0.5 border"
    style={{
      borderColor: 'var(--accent)',
      color: 'var(--accent)'
    }}
  >
    Syncing...
  </span>
)}
```

## Implementation Files

### New Files

1. **`lib/offline-db.ts`** - Dexie.js IndexedDB wrapper
2. **`lib/sync-queue.ts`** - Queue management helpers
3. **`components/OfflineIndicator.tsx`** - Offline banner component
4. **`components/Skeleton.tsx`** - Additional skeleton components (CameraList, FilmList, Stats)
5. **`public/sw.js`** - Custom service worker (replaces next-pwa generated one)
6. **`scripts/generate-sw.js`** - Build script for Workbox precache injection
7. **`public/manifest.json`** - PWA manifest (manual, no longer auto-generated)

### Modified Files

1. **`package.json`**
   - Remove: `next-pwa`
   - Add: `dexie@^4.0.0`, `workbox-build@^7.0.0`, `workbox-window@^7.0.0`
   - Update scripts: `"postbuild": "node scripts/generate-sw.js"`

2. **`next.config.js`**
   - Remove `withPWA()` wrapper
   - Keep existing config (turbopack, serverActions, etc.)

3. **`app/layout.tsx`**
   - Add `<link rel="manifest" href="/manifest.json">`
   - Add service worker registration in `useEffect`
   - Add `<OfflineIndicator />` component

4. **`app/api/rolls/route.ts`**
   - Add pagination: `?limit` and `?offset` query params
   - Add `Cache-Control` header to GET response

5. **`app/api/cameras/route.ts` and `app/api/films/route.ts`**
   - Add `Cache-Control: public, max-age=300` to GET responses

6. **`app/HomeClient.tsx` and `app/ArchiveClient.tsx`**
   - Update `useCachedData` hook to use IndexedDB fallback
   - Add "Syncing..." badge to offline-created rolls
   - Show `RollSkeleton` immediately while loading

7. **`hooks/useCachedData.ts`**
   - Add IndexedDB fallback logic
   - Listen for SW `SYNC_SUCCESS` messages to update UI

## Testing Strategy

### Manual Testing

1. **Offline viewing:**
   - Load app online
   - Disconnect network
   - Verify rolls/cameras/films still display
   - Verify "You're offline" banner appears

2. **Offline creation:**
   - Disconnect network
   - Create a new roll
   - Verify roll appears immediately with "Syncing..." badge
   - Reconnect network
   - Verify badge disappears and roll has real UUID

3. **Cold start performance:**
   - Clear all caches
   - Load app with throttled 3G network (Chrome DevTools)
   - Measure time to first paint (<1s target)
   - Measure time to interactive (<2s target)

4. **Service worker updates:**
   - Deploy new version
   - Verify SW updates automatically on next visit
   - Verify `skipWaiting` behavior (immediate activation)

### Edge Cases

1. **Sync conflict:** Server rejects roll (duplicate roll_number)
   - Show notification with error
   - Keep in sync_queue for manual review
   - Don't delete from IndexedDB

2. **Network flakiness:** Connection drops during sync
   - Retry up to 3 times
   - Exponential backoff between retries
   - Show persistent notification after max retries

3. **Multiple tabs:** User has app open in 2 tabs
   - IndexedDB is shared across tabs (native behavior)
   - SW messages broadcast to all clients
   - UI updates in all tabs when sync completes

4. **Quota exceeded:** IndexedDB storage full
   - Dexie throws `QuotaExceededError`
   - Show notification: "Storage full, please free up space"
   - Disable offline creation until quota available

## Migration Path

1. **Phase 1: Remove next-pwa**
   - Uninstall package
   - Update `next.config.js`
   - Test that app still builds and deploys

2. **Phase 2: Add IndexedDB layer**
   - Install Dexie
   - Create `lib/offline-db.ts`
   - Wire up hooks to write to IndexedDB on API success
   - No UI changes yet (data is cached but not used)

3. **Phase 3: Native SW + precaching**
   - Create `public/sw.js` template
   - Add `scripts/generate-sw.js` build script
   - Register SW in `app/layout.tsx`
   - Test precaching works (assets load from cache)

4. **Phase 4: Offline read support**
   - Update `useCachedData` hook to fallback to IndexedDB
   - Add `OfflineIndicator` component
   - Test offline viewing

5. **Phase 5: Offline write + sync**
   - Add `sync_queue` table to IndexedDB
   - Implement SW sync event handler
   - Add "Syncing..." badge to UI
   - Test offline creation and sync

6. **Phase 6: Performance optimizations**
   - Add skeletons to all pages
   - Implement API pagination
   - Add cache headers
   - Measure and verify improvements

## Success Criteria

- [ ] App loads and displays cached data when offline
- [ ] User can create rolls offline, synced when back online
- [ ] First paint < 1 second on 3G network (cold start)
- [ ] Time to interactive < 2 seconds on 3G network
- [ ] No regression in online performance
- [ ] Service worker updates automatically on deploy
- [ ] Sync queue processes all items within 30s of reconnect
- [ ] UI shows sync status clearly (offline banner, syncing badge)

## Open Questions

None - design is complete and ready for implementation.
