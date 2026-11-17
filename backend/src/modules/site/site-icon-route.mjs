import { HttpError, sendJson } from '../../shared/http.mjs';
import { findSiteIcon } from './site-icon-resolver.mjs';

const SITE_ICON_PATH = '/api/site-icon';
const MAX_SITE_URL_LENGTH = 2048;
const ICON_MAX_AGE_SECONDS = 24 * 60 * 60;

function parseSiteUrl(url) {
  const rawSiteUrl = url.searchParams.get('url') ?? '';
  if (rawSiteUrl.length > MAX_SITE_URL_LENGTH) throw new HttpError(400, 'Site URL too long');
  try {
    const siteUrl = new URL(rawSiteUrl);
    if (siteUrl.protocol === 'http:' || siteUrl.protocol === 'https:') return siteUrl.href;
  } catch {
    // Falls through to the rejection below.
  }
  throw new HttpError(400, 'Invalid site URL');
}

/** GET `/api/site-icon?url=<site url>`: proxies the site's best declared icon, or 404 so the client shows a monogram. */
export async function routeSiteIconRequest(request, response, url) {
  if (request.method !== 'GET' || url.pathname !== SITE_ICON_PATH) return false;

  const icon = await findSiteIcon(parseSiteUrl(url));
  if (!icon) {
    sendJson(response, 404, { error: 'Icon not found' });
    return true;
  }
  response.writeHead(200, {
    'Content-Type': icon.contentType,
    'Content-Length': icon.body.length,
    'Cache-Control': `private, max-age=${ICON_MAX_AGE_SECONDS}`,
    // Third-party SVG is served from our origin, so it must never run scripts if opened directly.
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(icon.body);
  return true;
}
