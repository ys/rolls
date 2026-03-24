/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// This is injected by @serwist/build during build
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/offline.html',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

// Background Sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-rolls') {
    event.waitUntil(syncRolls());
  }
});

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('RollsDB', 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

async function deleteFromStore(db: IDBDatabase, storeName: string, key: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function updateInStore(db: IDBDatabase, storeName: string, value: object): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function notifyClients(message: object): Promise<void> {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => client.postMessage(message));
}

interface SyncItem {
  id: number;
  type: 'create_roll' | 'update_roll' | 'create_camera' | 'create_film';
  data: Record<string, unknown>;
  apiKey: string;
  timestamp: number;
  retries: number;
}

async function syncRolls(): Promise<void> {
  let db: IDBDatabase;
  try {
    db = await openDB();
  } catch {
    return;
  }

  const items = await getAllFromStore<SyncItem>(db, 'sync_queue');
  if (items.length === 0) return;

  let synced = 0;

  for (const item of items) {
    if (item.retries >= 3) continue;

    try {
      if (item.type === 'create_roll') {
        const response = await fetch('/api/rolls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${item.apiKey}`,
          },
          body: JSON.stringify(item.data),
        });

        if (response.ok) {
          const serverRoll = await response.json() as Record<string, unknown>;
          await deleteFromStore(db, 'sync_queue', item.id);
          synced++;
          await notifyClients({ type: 'SYNC_SUCCESS', tempUuid: item.data.uuid, serverRoll });
        } else {
          await updateInStore(db, 'sync_queue', { ...item, retries: item.retries + 1 });
        }

      } else if (item.type === 'update_roll') {
        const { roll_number, uuid, user_id, ...patch } = item.data;
        const response = await fetch(`/api/rolls/${roll_number}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${item.apiKey}`,
          },
          body: JSON.stringify(patch),
        });

        if (response.ok) {
          await deleteFromStore(db, 'sync_queue', item.id);
          synced++;
          await notifyClients({ type: 'SYNC_SUCCESS', rollNumber: roll_number });
        } else {
          await updateInStore(db, 'sync_queue', { ...item, retries: item.retries + 1 });
        }

      } else if (item.type === 'create_camera') {
        const { uuid, user_id, ...body } = item.data;
        const response = await fetch('/api/cameras', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${item.apiKey}`,
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const serverCamera = await response.json() as Record<string, unknown>;
          await deleteFromStore(db, 'sync_queue', item.id);
          synced++;
          await notifyClients({ type: 'SYNC_SUCCESS', tempCameraUuid: uuid, serverCamera });
        } else {
          await updateInStore(db, 'sync_queue', { ...item, retries: item.retries + 1 });
        }

      } else if (item.type === 'create_film') {
        const { uuid, user_id, ...body } = item.data;
        const response = await fetch('/api/films', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${item.apiKey}`,
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const serverFilm = await response.json() as Record<string, unknown>;
          await deleteFromStore(db, 'sync_queue', item.id);
          synced++;
          await notifyClients({ type: 'SYNC_SUCCESS', tempFilmUuid: uuid, serverFilm });
        } else {
          await updateInStore(db, 'sync_queue', { ...item, retries: item.retries + 1 });
        }
      }
    } catch {
      await updateInStore(db, 'sync_queue', { ...item, retries: item.retries + 1 });
    }
  }

  const remaining = items.length - synced;
  await notifyClients({ type: 'SYNC_STATUS', count: remaining });
}

serwist.addEventListeners();
