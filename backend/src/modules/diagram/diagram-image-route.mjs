import { log } from '../../infrastructure/logger.mjs';
import { fetchRemoteImage } from '../../infrastructure/remote-fetch.mjs';
import { readWebUrlParam, sendJson, sendRevalidatableRemoteImage } from '../../shared/http.mjs';

const DIAGRAM_IMAGE_PATH = '/api/diagram-image';
// Architecture exports (large PNGs, embedded-font SVGs) run far bigger than icons.
const MAX_DIAGRAM_IMAGE_BYTES = 20 * 1024 * 1024;

/**
 * GET `/api/diagram-image?url=<image url>`: proxies a diagram hosted elsewhere, so the browser never contacts that host.
 * Diagrams are re-exported in place at a fixed share URL, so a max-age would pin stale versions in the browser.
 */
export async function routeDiagramImageRequest(request, response, url) {
  if (request.method !== 'GET' || url.pathname !== DIAGRAM_IMAGE_PATH) return false;

  const imageUrl = readWebUrlParam(url);
  const image = await fetchRemoteImage(imageUrl, MAX_DIAGRAM_IMAGE_BYTES);
  if (!image) {
    log('warn', 'DiagramImage', 'Remote image unavailable', { url: imageUrl });
    sendJson(response, 404, { error: 'Image not found' });
    return true;
  }
  sendRevalidatableRemoteImage(request, response, image);
  return true;
}
