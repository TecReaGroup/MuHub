import { log, serializeError } from '../../infrastructure/logger.mjs';
import { fetchRemote, fetchRemoteImage } from '../../infrastructure/remote-fetch.mjs';

const MAX_HTML_BYTES = 512 * 1024;
const MAX_ICON_BYTES = 1024 * 1024;
const RESOLVED_TTL_MS = 24 * 60 * 60 * 1000;
const MISSING_TTL_MS = 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;
// Tried after the site's own icons, for sites behind bot protection (e.g. Cloudflare challenges server IPs).
// Both answer unknown domains with 404, so a generic globe is never mistaken for a logo.
// NOTE: these services learn the hostnames of saved sites; remove them to keep lookups private.
const PUBLIC_ICON_SERVICES = [
  hostname => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`,
  hostname => `https://icons.duckduckgo.com/ip3/${encodeURIComponent(hostname)}.ico`,
];
// Rank when `sizes` is absent: apple-touch-icon is 180px by convention, a bare icon is usually a 16-32px .ico.
const DEFAULT_APPLE_TOUCH_SIZE = 180;
const DEFAULT_ICON_SIZE = 32;
const FALLBACK_ICON_SIZE = 0;

const LINK_TAG_PATTERN = /<link\b[^>]*>/gi;
// name="value" | name='value' | name=value
const ATTRIBUTE_PATTERN = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;

/** @type {Map<string, { expiresAt: number, icon: Promise<{ body: Buffer, contentType: string } | null> }>} */
const iconCache = new Map();

/**
 * Reads the page only up to `</head>`, where icon links live; homepages like GitHub's run to megabytes,
 * so reading the whole body would hit MAX_HTML_BYTES and lose the icons.
 */
async function readHtmlHead(response) {
  if (!response.body) return '';
  const decoder = new TextDecoder();
  let html = '';
  for await (const chunk of response.body) {
    html += decoder.decode(chunk, { stream: true });
    const headEnd = html.search(/<\/head>/i);
    if (headEnd >= 0 || html.length > MAX_HTML_BYTES) {
      await response.body.cancel().catch(() => {});
      return headEnd >= 0 ? html.slice(0, headEnd) : html;
    }
  }
  return html;
}

function parseAttributes(tag) {
  const attributes = {};
  for (const [, name, doubleQuoted, singleQuoted, bare] of tag.matchAll(ATTRIBUTE_PATTERN)) {
    attributes[name.toLowerCase()] = doubleQuoted ?? singleQuoted ?? bare;
  }
  return attributes;
}

function iconRank({ rel, sizes, type, href }) {
  if (type === 'image/svg+xml' || /\.svg(?:[?#]|$)/i.test(href)) return Number.POSITIVE_INFINITY;
  if (sizes?.toLowerCase() === 'any') return Number.POSITIVE_INFINITY;
  const declaredSizes = (sizes ?? '').match(/\d+(?=x\d+)/gi)?.map(Number) ?? [];
  if (declaredSizes.length > 0) return Math.max(...declaredSizes);
  return rel.includes('apple-touch-icon') ? DEFAULT_APPLE_TOUCH_SIZE : DEFAULT_ICON_SIZE;
}

/** Icon URLs declared by the page, best first, then `/favicon.ico`, then public icon services. */
function listIconCandidates(html, pageUrl) {
  const candidates = [];
  for (const [tag] of html.matchAll(LINK_TAG_PATTERN)) {
    const { rel = '', href, sizes, type } = parseAttributes(tag);
    const relTokens = rel.toLowerCase().split(/\s+/);
    // mask-icon is a monochrome Safari silhouette, not a logo.
    if (!href || relTokens.includes('mask-icon') || !relTokens.some(token => token === 'icon' || token.startsWith('apple-touch-icon'))) continue;
    try {
      candidates.push({ url: new URL(href, pageUrl).href, rank: iconRank({ rel: relTokens.join(' '), sizes, type, href }) });
    } catch {
      // Unparseable href; skip it.
    }
  }
  candidates.push({ url: new URL('/favicon.ico', pageUrl).href, rank: FALLBACK_ICON_SIZE });
  candidates.sort((left, right) => right.rank - left.rank);
  const { hostname } = new URL(pageUrl);
  return [...new Set([...candidates.map(candidate => candidate.url), ...PUBLIC_ICON_SERVICES.map(serviceUrl => serviceUrl(hostname))])];
}

async function fetchPageHtml(siteUrl) {
  try {
    const response = await fetchRemote(siteUrl);
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok || !contentType.includes('html')) {
      await response.body?.cancel().catch(() => {});
      log('warn', 'SiteIcon', 'Site page unusable', { url: siteUrl, statusCode: response.status, contentType });
      return { html: '', pageUrl: response.url || siteUrl };
    }
    return { html: await readHtmlHead(response), pageUrl: response.url || siteUrl };
  } catch (error) {
    log('warn', 'SiteIcon', 'Failed to fetch site page', { url: siteUrl, error: serializeError(error) });
    return { html: '', pageUrl: siteUrl };
  }
}

async function resolveIcon(siteUrl) {
  const { html, pageUrl } = await fetchPageHtml(siteUrl);
  for (const iconUrl of listIconCandidates(html, pageUrl)) {
    const icon = await fetchRemoteImage(iconUrl, MAX_ICON_BYTES);
    if (icon) {
      log('info', 'SiteIcon', 'Icon resolved', { url: siteUrl, icon: iconUrl, size: icon.body.length });
      return icon;
    }
  }
  log('warn', 'SiteIcon', 'No icon found', { url: siteUrl });
  return null;
}

function rememberIcon(siteUrl, icon) {
  if (iconCache.size >= MAX_CACHE_ENTRIES) iconCache.delete(iconCache.keys().next().value);
  iconCache.set(siteUrl, { expiresAt: Date.now() + RESOLVED_TTL_MS, icon });
  // Misses are retried sooner, since the site may just have been down.
  icon.then(resolved => {
    if (!resolved && iconCache.get(siteUrl)?.icon === icon) iconCache.set(siteUrl, { expiresAt: Date.now() + MISSING_TTL_MS, icon });
  });
}

/**
 * Finds the best icon a site declares, cached per site URL; concurrent requests share one lookup.
 *
 * @param {string} siteUrl Absolute http(s) URL, already validated by the caller.
 * @returns {Promise<{ body: Buffer, contentType: string } | null>} null when the site has no reachable image icon.
 */
export function findSiteIcon(siteUrl) {
  const cached = iconCache.get(siteUrl);
  if (cached && cached.expiresAt > Date.now()) return cached.icon;
  const icon = resolveIcon(siteUrl);
  rememberIcon(siteUrl, icon);
  return icon;
}
