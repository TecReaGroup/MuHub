import { readWebUrlParam, sendJson, sendRemoteImage } from '../../shared/http.mjs';
import { findSiteIcon } from './site-icon-resolver.mjs';

const SITE_ICON_PATH = '/api/site-icon';
const ICON_MAX_AGE_SECONDS = 24 * 60 * 60;

/** GET `/api/site-icon?url=<site url>`: proxies the site's best declared icon, or 404 so the client shows a monogram. */
export async function routeSiteIconRequest(request, response, url) {
  if (request.method !== 'GET' || url.pathname !== SITE_ICON_PATH) return false;

  const icon = await findSiteIcon(readWebUrlParam(url));
  if (!icon) {
    sendJson(response, 404, { error: 'Icon not found' });
    return true;
  }
  sendRemoteImage(response, icon, ICON_MAX_AGE_SECONDS);
  return true;
}
