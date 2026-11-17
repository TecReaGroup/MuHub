import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { log, serializeError } from '../infrastructure/logger.mjs';
import { hasAccess } from '../modules/auth/access-session.mjs';
import { routeAuthRequest } from '../modules/auth/auth-route.mjs';
import { routeDiagramRequest } from '../modules/diagram/diagram-route.mjs';
import { routeSiteIconRequest } from '../modules/site/site-icon-route.mjs';
import { routeSiteRequest } from '../modules/site/site-route.mjs';
import { HttpError, sendJson } from '../shared/http.mjs';
import { streamFrontend } from './static-handler.mjs';

const COLLECTION_ROUTES = [routeSiteRequest, routeDiagramRequest];

async function routeRequest(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (await routeAuthRequest(request, response, url)) return;

  const isApiRequest = url.pathname === '/api' || url.pathname.startsWith('/api/');
  if (isApiRequest && !hasAccess(request)) {
    sendJson(response, 401, { error: 'Login required' });
    return;
  }

  if (await routeSiteIconRequest(request, response, url)) return;

  for (const routeCollectionRequest of COLLECTION_ROUTES) {
    if (await routeCollectionRequest(request, response, url)) return;
  }

  if (isApiRequest) {
    sendJson(response, 404, { error: 'Route not found' });
    return;
  }

  if (request.method === 'GET') {
    if (await streamFrontend(request, response, url.pathname)) return;
    if (!extname(url.pathname) && await streamFrontend(request, response, '/')) return;
  }

  sendJson(response, 404, { error: 'Route not found' });
}

export async function handleRequest(request, response) {
  const requestId = request.headers['x-request-id']?.toString().slice(0, 128) || randomUUID();
  const startedAt = Date.now();
  response.setHeader('X-Request-Id', requestId);

  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    await routeRequest(request, response, url);
  } catch (error) {
    if (request.aborted || response.destroyed || error?.code === 'ECONNRESET' || error?.code === 'ECONNABORTED') return;
    if (error instanceof HttpError) {
      log('warn', 'HTTP', 'Request rejected', {
        requestId,
        method: request.method,
        statusCode: error.statusCode,
        reason: error.message,
      });
      sendJson(response, error.statusCode, { error: error.message });
      return;
    }
    log('error', 'HTTP', 'Request failed', {
      requestId,
      method: request.method,
      durationMs: Date.now() - startedAt,
      error: serializeError(error),
    });
    if (response.headersSent) {
      response.destroy();
      return;
    }
    sendJson(response, error instanceof URIError ? 400 : 500, {
      error: error instanceof URIError ? 'Invalid request path' : 'Internal server error',
    });
  }
}
