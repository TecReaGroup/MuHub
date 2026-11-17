import { setTimeout as sleep } from 'node:timers/promises';
import { log } from '../../infrastructure/logger.mjs';
import { assertJsonObject } from '../../shared/draft-field.mjs';
import { HttpError, readJsonBody, sendJson, sendNoContent } from '../../shared/http.mjs';
import { accessCookieHeader, hasAccess, isAccessPassword } from './access-session.mjs';

const LOGIN_PATH = '/api/auth/login';
const SESSION_PATH = '/api/auth/session';
// Slows password guessing to one try per second per connection without keeping lockout state.
const LOGIN_FAILURE_DELAY_MS = 1000;

function parsePassword(body) {
  assertJsonObject(body);
  if (typeof body.password !== 'string' || body.password === '') throw new HttpError(400, 'password is required');
  return body.password;
}

async function login(request, response) {
  const password = parsePassword(await readJsonBody(request));
  if (!isAccessPassword(password)) {
    await sleep(LOGIN_FAILURE_DELAY_MS);
    log('warn', 'Auth', 'Login rejected', { ip: request.socket.remoteAddress });
    sendJson(response, 401, { error: 'Incorrect password' });
    return;
  }
  log('info', 'Auth', 'Login succeeded', { ip: request.socket.remoteAddress });
  response.setHeader('Set-Cookie', accessCookieHeader(request));
  sendNoContent(response);
}

/** Routes `POST /api/auth/login` and `GET /api/auth/session`; false for any other request. */
export async function routeAuthRequest(request, response, url) {
  if (request.method === 'POST' && url.pathname === LOGIN_PATH) {
    await login(request, response);
    return true;
  }
  if (request.method === 'GET' && url.pathname === SESSION_PATH) {
    if (hasAccess(request)) sendNoContent(response);
    else sendJson(response, 401, { error: 'Login required' });
    return true;
  }
  return false;
}
