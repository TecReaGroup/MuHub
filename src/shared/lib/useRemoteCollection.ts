import { useCallback, useEffect, useState } from 'react';
import type { CollectionClient } from './collection-client';
import { log, serializeError } from './logger';

export type CollectionStatus = 'loading' | 'ready' | 'unavailable';

/**
 * Server-backed list state. Mutations reject on failure and leave local state untouched.
 * `client` must be a module-level constant so the initial load runs once.
 */
export function useRemoteCollection<Item extends { id: string }, Draft>(client: CollectionClient<Item, Draft>, moduleName: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<CollectionStatus>('loading');

  useEffect(() => {
    let isCurrent = true;
    client.list()
      .then(loadedItems => {
        if (!isCurrent) return;
        setItems(loadedItems);
        setStatus('ready');
      })
      .catch(error => {
        if (!isCurrent) return;
        log('error', moduleName, 'Failed to load collection', serializeError(error));
        setStatus('unavailable');
      });
    return () => { isCurrent = false; };
  }, [client, moduleName]);

  const addItem = useCallback(async (draft: Draft) => {
    const item = await client.create(draft);
    setItems(current => [item, ...current]);
    return item;
  }, [client]);

  const editItem = useCallback(async (id: string, draft: Draft) => {
    const item = await client.update(id, draft);
    setItems(current => current.map(existing => (existing.id === id ? item : existing)));
    return item;
  }, [client]);

  const removeItem = useCallback(async (id: string) => {
    await client.remove(id);
    setItems(current => current.filter(existing => existing.id !== id));
  }, [client]);

  return { items, status, addItem, editItem, removeItem };
}
