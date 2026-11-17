import { log } from '../infrastructure/logger.mjs';
import { parseItemOrder } from '../shared/item-order.mjs';
import { HttpError, readJsonBody, sendJson, sendNoContent, sendRevalidatableJson } from '../shared/http.mjs';

/**
 * Builds the REST router for one collection store:
 * GET/POST `basePath`, PUT `basePath/order`, PUT/DELETE `basePath/<id>`.
 *
 * @returns {(request, response, url: URL) => Promise<boolean>} false when the request is not for this collection.
 */
export function createCollectionRoute({ basePath, store, parseDraft, moduleName }) {
  // `<basePath>/<id>`, where id is a UUID-like token.
  const itemPattern = new RegExp(`^${basePath}/([\\w-]{1,64})$`);
  // Also matches itemPattern, so it must be checked before item routes.
  const orderPath = `${basePath}/order`;

  async function routeCollection(request, response) {
    if (request.method === 'GET') {
      sendRevalidatableJson(request, response, { items: await store.list() });
      return true;
    }
    if (request.method === 'POST') {
      const item = await store.create(parseDraft(await readJsonBody(request)));
      log('info', moduleName, 'Item created', { id: item.id });
      sendJson(response, 201, item);
      return true;
    }
    return false;
  }

  async function routeOrder(request, response) {
    if (request.method !== 'PUT') return false;
    const ids = parseItemOrder(await readJsonBody(request));
    await store.reorder(ids);
    log('info', moduleName, 'Items reordered', { count: ids.length });
    sendNoContent(response);
    return true;
  }

  async function routeItem(request, response, id) {
    if (request.method === 'PUT') {
      const item = await store.update(id, parseDraft(await readJsonBody(request)));
      if (!item) throw new HttpError(404, 'Item not found');
      log('info', moduleName, 'Item updated', { id });
      sendJson(response, 200, item);
      return true;
    }
    if (request.method === 'DELETE') {
      if (!await store.remove(id)) throw new HttpError(404, 'Item not found');
      log('info', moduleName, 'Item deleted', { id });
      sendNoContent(response);
      return true;
    }
    return false;
  }

  return async function routeCollectionRequest(request, response, url) {
    if (url.pathname === basePath) return routeCollection(request, response);
    if (url.pathname === orderPath) return routeOrder(request, response);
    const itemMatch = itemPattern.exec(url.pathname);
    if (itemMatch) return routeItem(request, response, itemMatch[1]);
    return false;
  };
}
