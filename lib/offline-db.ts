import Dexie, { type EntityTable } from 'dexie';
import type { Roll, Camera, Film } from './db';

interface SyncItem {
  id?: number;
  type: 'create_roll';
  data: Partial<Roll>;
  apiKey: string;
  timestamp: number;
  retries: number;
}

interface MetadataItem {
  key: string;
  value: unknown;
}

class RollsDB extends Dexie {
  rolls!: EntityTable<Roll, 'uuid'>;
  cameras!: EntityTable<Camera, 'uuid'>;
  films!: EntityTable<Film, 'uuid'>;
  sync_queue!: EntityTable<SyncItem, 'id'>;
  metadata!: EntityTable<MetadataItem, 'key'>;

  constructor() {
    super('RollsDB');
    this.version(1).stores({
      rolls: 'uuid, roll_number, user_id',
      cameras: 'uuid, slug, user_id',
      films: 'uuid, slug, user_id',
      sync_queue: '++id, type, timestamp, retries',
      metadata: 'key',
    });
  }
}

export const db = new RollsDB();

export type { SyncItem, MetadataItem };

export async function setLastSyncTime(collection: string): Promise<void> {
  await db.metadata.put({ key: `${collection}_last_sync`, value: Date.now() });
}

export async function getLastSyncTime(collection: string): Promise<number | null> {
  const item = await db.metadata.get(`${collection}_last_sync`);
  return typeof item?.value === 'number' ? item.value : null;
}

export async function getTimeSinceSync(collection: string): Promise<string> {
  const lastSync = await getLastSyncTime(collection);
  if (!lastSync) return 'Never synced';

  const minutes = Math.floor((Date.now() - lastSync) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
