import { log, serializeError } from '../lib/logger';
import { requestJson } from './request-json';

// A list fetched more recently than this is served from memory without asking the server.
const STALE_TIME_MS = 30_000;

export type CollectionStatus = 'loading' | 'ready' | 'unavailable';

export interface CollectionSnapshot<Item> {
  items: Item[];
  status: CollectionStatus;
}

export interface CollectionStore<Item, Draft> {
  readonly moduleName: string;
  /** `useSyncExternalStore` contract; subscribing also revalidates a stale list. */
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => CollectionSnapshot<Item>;
  /** Mutations reject on failure and leave the cache untouched. */
  create: (draft: Draft) => Promise<Item>;
  update: (id: string, draft: Draft) => Promise<Item>;
  remove: (id: string) => Promise<void>;
}

/**
 * Stale-while-revalidate cache for one REST collection built by the backend's `createCollectionRoute`.
 *
 * Shared by every subscriber: revisiting a page renders the cached list immediately, concurrent
 * loads share one request, mutations write through, and a stale list refreshes in the background
 * on mount or when the tab becomes visible. The backend's ETag makes those refreshes a cheap 304.
 */
export function createCollectionStore<Item extends { id: string }, Draft>(
  endpoint: string,
  moduleName: string,
): CollectionStore<Item, Draft> {
  const listeners = new Set<() => void>();
  let snapshot: CollectionSnapshot<Item> = { items: [], status: 'loading' };
  let fetchedAt = 0;
  let pendingLoad: Promise<void> | null = null;
  // Bumped by every applied mutation: a list response requested before it is outdated and must be refetched.
  let revision = 0;

  const itemPath = (id: string) => `${endpoint}/${encodeURIComponent(id)}`;

  function publish(next: CollectionSnapshot<Item>) {
    snapshot = next;
    listeners.forEach(notify => notify());
  }

  function load() {
    const requestedRevision = revision;
    let isOutdated = false;
    pendingLoad = requestJson<{ items: Item[] }>(endpoint)
      .then(({ items }) => {
        isOutdated = requestedRevision !== revision;
        if (isOutdated) return;
        fetchedAt = Date.now();
        publish({ items, status: 'ready' });
      })
      .catch(error => {
        // A failed background refresh keeps showing the last good list.
        if (snapshot.status === 'ready') {
          log('warn', moduleName, 'Failed to refresh collection', serializeError(error));
          return;
        }
        log('error', moduleName, 'Failed to load collection', serializeError(error));
        publish({ items: [], status: 'unavailable' });
      })
      .finally(() => {
        pendingLoad = null;
        if (isOutdated) load();
      });
  }

  function revalidateIfStale() {
    if (!pendingLoad && Date.now() - fetchedAt > STALE_TIME_MS) load();
  }

  function revalidateWhenVisible() {
    if (document.visibilityState === 'visible') revalidateIfStale();
  }

  // Transforms must be idempotent: a list fetched mid-mutation may already contain its outcome.
  function applyMutation(transform: (items: Item[]) => Item[]) {
    revision += 1;
    publish({ ...snapshot, items: transform(snapshot.items) });
  }

  return {
    moduleName,

    subscribe(onChange) {
      listeners.add(onChange);
      if (listeners.size === 1) document.addEventListener('visibilitychange', revalidateWhenVisible);
      revalidateIfStale();
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0) document.removeEventListener('visibilitychange', revalidateWhenVisible);
      };
    },

    getSnapshot: () => snapshot,

    async create(draft) {
      const item = await requestJson<Item>(endpoint, { method: 'POST', body: JSON.stringify(draft) });
      applyMutation(items => [item, ...items.filter(existing => existing.id !== item.id)]);
      return item;
    },

    async update(id, draft) {
      const item = await requestJson<Item>(itemPath(id), { method: 'PUT', body: JSON.stringify(draft) });
      applyMutation(items => items.map(existing => (existing.id === id ? item : existing)));
      return item;
    },

    async remove(id) {
      await requestJson<void>(itemPath(id), { method: 'DELETE' });
      applyMutation(items => items.filter(existing => existing.id !== id));
    },
  };
}
