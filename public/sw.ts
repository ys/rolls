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
});

// Background Sync for offline roll creation (placeholder)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-rolls') {
    event.waitUntil(syncRolls());
  }
});

async function syncRolls() {
  console.log('Background sync triggered');
  // Implementation will be added in later tasks
}

serwist.addEventListeners();

console.log('Service Worker loaded');
