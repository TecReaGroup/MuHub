import { createHash } from 'node:crypto';

const MAX_JSON_BODY_BYTES = 64 * 1024;

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, { ...JSON_HEADERS, 'Cache-Control': 'no-store', ...headers });
  response.end(JSON.stringify(value));
}

/** True when the request's If-None-Match already names `etag` (weak comparison, RFC 9110 §13.1.2). */
export function matchesEtag(request, etag) {
  const header = request.headers['if-none-match'];
  if (!header) return false;
  const strip = tag => tag.trim().replace(/^W\//, '');
  return header.trim() === '*' || header.split(',').some(tag => strip(tag) === strip(etag));
}

/**
 * Sends a 200 JSON response the browser may cache but must revalidate, answering 304 when unchanged.
 * The ETag hashes the body, so it stays valid across restarts, unlike an in-memory revision counter.
 */
export function sendRevalidatableJson(request, response, value) {
  const body = JSON.stringify(value);
  const etag = `"${createHash('sha1').update(body).digest('base64url')}"`;
  const cacheHeaders = { 'Cache-Control': 'no-cache', ETag: etag };
  if (matchesEtag(request, etag)) {
    response.writeHead(304, cacheHeaders);
    response.end();
    return;
  }
  response.writeHead(200, { ...JSON_HEADERS, ...cacheHeaders });
  response.end(body);
}

export function sendNoContent(response) {
  response.writeHead(204, { 'Cache-Control': 'no-store' });
  response.end();
}

export async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_JSON_BODY_BYTES) throw new HttpError(413, 'Request body too large');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}
