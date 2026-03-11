---
title: "iOS: Offline caching & sync"
labels: enhancement, ios
---

App stays usable with no connectivity; edits queue and sync when back online.

## Strategy

- **Read cache**: on successful API fetch, write JSON to `Documents/cache/{resource}.json`
- **Startup**: load cache immediately → show stale data → fetch in background → merge
- **Write queue**: pending mutations stored in `Documents/pending-ops.json`
- **Connectivity**: `NWPathMonitor` watches network status; drain queue on reconnect
- **Conflicts**: last-write-wins using `updated_at` from server response

## Tasks

- [ ] `CacheStore` — read/write JSON files in `Documents/cache/`
- [ ] Stores initialise from cache, then call API in background
- [ ] `PendingOp` model: `{ id, method, path, body, enqueuedAt }`
- [ ] `SyncManager` drains pending ops on reconnect (serial, in order)
- [ ] `NWPathMonitor` updates `@Observable NetworkMonitor.isConnected`
- [ ] "Offline" banner (amber) when disconnected; "Synced" (green flash) on reconnect
- [ ] Failed sync op after 3 retries → surface as persistent error badge

## Out of scope (for now)

- `BGAppRefreshTask` — foreground refresh on app open is sufficient
- Full conflict resolution — last-write-wins is fine for a single-user app
