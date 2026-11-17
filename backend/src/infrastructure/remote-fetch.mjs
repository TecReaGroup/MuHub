const FETCH_TIMEOUT_MS = 5000;
// Some self-hosted apps reject requests without a browser-like User-Agent.
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; MuHub)',
  Accept: 'text/html,application/xhtml+xml,image/avif,image/webp,image/*,*/*;q=0.8',
};

/** GETs a third-party URL on behalf of the browser, which only ever talks to our origin. */
export function fetchRemote(url) {
  return fetch(url, { headers: REQUEST_HEADERS, redirect: 'follow', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}

/** Reads at most `maxBytes`; resolves null when the body is larger. */
async function readBodyWithin(response, maxBytes) {
  if (!response.body) return Buffer.alloc(0);
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > maxBytes) {
      await response.body.cancel().catch(() => {});
      return null;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Downloads a third-party image; SPAs answer unknown paths with index.html, so the Content-Type is the only proof of an image.
 *
 * @returns {Promise<{ body: Buffer, contentType: string } | null>} null when unreachable, not an image, empty or over `maxBytes`.
 */
export async function fetchRemoteImage(url, maxBytes) {
  try {
    const response = await fetchRemote(url);
    const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? '';
    if (!response.ok || !contentType.startsWith('image/')) {
      await response.body?.cancel().catch(() => {});
      return null;
    }
    const body = await readBodyWithin(response, maxBytes);
    return body && body.length > 0 ? { body, contentType } : null;
  } catch {
    return null;
  }
}
