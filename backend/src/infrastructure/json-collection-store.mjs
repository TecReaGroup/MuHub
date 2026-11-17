import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { log } from './logger.mjs';

/**
 * A list of records persisted as one JSON file, seeded on first read.
 *
 * Mutations run one at a time so concurrent requests never overwrite each other,
 * and each write goes to a temp file first so a crash cannot leave a half-written file.
 */
export function createJsonCollectionStore({ filePath, seedDrafts, moduleName }) {
  let itemsPromise = null;
  let mutationQueue = Promise.resolve();

  function buildItem(draft) {
    return { id: randomUUID(), ...draft, createdAt: new Date().toISOString() };
  }

  async function writeItems(items) {
    await mkdir(dirname(filePath), { recursive: true });
    const temporaryFile = `${filePath}.tmp`;
    await writeFile(temporaryFile, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
    await rename(temporaryFile, filePath);
  }

  async function readItems() {
    try {
      return JSON.parse(await readFile(filePath, 'utf8'));
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      const seededItems = seedDrafts.map(buildItem);
      await writeItems(seededItems);
      log('info', moduleName, 'Seeded collection', { count: seededItems.length });
      return seededItems;
    }
  }

  function loadItems() {
    itemsPromise ??= readItems().catch(error => {
      itemsPromise = null;
      throw error;
    });
    return itemsPromise;
  }

  function mutate(transform) {
    const mutation = mutationQueue.then(async () => {
      const { nextItems, outcome } = transform(await loadItems());
      await writeItems(nextItems);
      itemsPromise = Promise.resolve(nextItems);
      return outcome;
    });
    mutationQueue = mutation.catch(() => {});
    return mutation;
  }

  return {
    async list() {
      return [...await loadItems()];
    },

    create(draft) {
      return mutate(items => {
        const item = buildItem(draft);
        return { nextItems: [item, ...items], outcome: item };
      });
    },

    /** Resolves to the updated item, or null when the id is unknown. */
    update(id, draft) {
      return mutate(items => {
        const current = items.find(item => item.id === id);
        if (!current) return { nextItems: items, outcome: null };
        const updated = { ...current, ...draft };
        return { nextItems: items.map(item => (item.id === id ? updated : item)), outcome: updated };
      });
    },

    /**
     * Rearranges items to follow `ids`. Unknown ids are skipped; items missing from `ids`
     * (e.g. created concurrently) stay in front, where `create` puts new items.
     */
    reorder(ids) {
      return mutate(items => {
        const rank = new Map(ids.map((id, index) => [id, index]));
        const unranked = items.filter(item => !rank.has(item.id));
        const ranked = items.filter(item => rank.has(item.id)).sort((a, b) => rank.get(a.id) - rank.get(b.id));
        return { nextItems: [...unranked, ...ranked], outcome: undefined };
      });
    },

    /** Resolves to false when the id is unknown. */
    remove(id) {
      return mutate(items => {
        const nextItems = items.filter(item => item.id !== id);
        return { nextItems, outcome: nextItems.length !== items.length };
      });
    },
  };
}
