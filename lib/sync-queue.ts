import { db, type SyncItem } from './offline-db';
import type { Roll } from './db';

export async function addToSyncQueue(
  type: 'create_roll',
  data: Partial<Roll>,
  apiKey: string
): Promise<number> {
  const id = await db.sync_queue.add({
    type,
    data,
    apiKey,
    timestamp: Date.now(),
    retries: 0,
  });
  return id as number;
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
