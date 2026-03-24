import { db, type SyncItem } from './offline-db';
import type { Roll } from './db';

export async function addToSyncQueue(
  type: 'create_roll' | 'update_roll' | 'create_camera' | 'create_film',
  data: Record<string, unknown>,
  apiKey: string
): Promise<number> {
  const id = await db.sync_queue.add({
    type,
    data: data as Partial<Roll>,
    apiKey,
    timestamp: Date.now(),
    retries: 0,
  });
  return id as number;
}

/**
 * Merges a patch into an existing pending update_roll for the same roll_number,
 * or enqueues a new one. Prevents duplicate queue entries for the same roll.
 */
export async function mergeRollUpdate(
  roll_number: string,
  patch: Partial<Roll>,
  apiKey: string
): Promise<void> {
  const existing = await db.sync_queue
    .filter((item) => item.type === 'update_roll' && (item.data as Record<string, unknown>).roll_number === roll_number)
    .first();

  if (existing && existing.id != null) {
    await db.sync_queue.update(existing.id, {
      data: { ...existing.data, ...patch, roll_number } as Partial<Roll>,
    });
  } else {
    await addToSyncQueue('update_roll', { roll_number, ...patch }, apiKey);
  }
}

export async function getSyncQueueItems(): Promise<SyncItem[]> {
  return await db.sync_queue.toArray();
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  await db.sync_queue.delete(id);
}

export async function incrementSyncRetries(id: number): Promise<void> {
  const item = await db.sync_queue.get(id);
  if (item) {
    await db.sync_queue.update(id, { retries: item.retries + 1 });
  }
}

export async function getSyncQueueCount(): Promise<number> {
  return await db.sync_queue.count();
}

export function generateOfflineUuid(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `offline-${timestamp}-${random}`;
}

export function isOfflineUuid(uuid: string): boolean {
  return uuid.startsWith('offline-');
}

export async function registerBackgroundSync(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await (reg as ServiceWorkerRegistration & { sync: { register(tag: string): Promise<void> } }).sync
      .register('sync-rolls');
  } catch {
    // Background sync not supported or registration failed
  }
}
