import { assertJsonObject } from './draft-field.mjs';
import { HttpError } from './http.mjs';

// Same token shape the collection route accepts as an item id.
const ITEM_ID_PATTERN = /^[\w-]{1,64}$/;

/** Parses `{ ids: string[] }`, the full item order after a drag, into a duplicate-free id list. */
export function parseItemOrder(body) {
  assertJsonObject(body);
  const { ids } = body;
  if (!Array.isArray(ids) || !ids.every(id => typeof id === 'string' && ITEM_ID_PATTERN.test(id))) {
    throw new HttpError(400, 'ids must be an array of item ids');
  }
  if (new Set(ids).size !== ids.length) throw new HttpError(400, 'ids must not repeat');
  return ids;
}
