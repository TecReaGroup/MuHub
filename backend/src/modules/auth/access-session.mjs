import { createHmac, timingSafeEqual } from 'node:crypto';
import { environment } from '../../config/environment.mjs';

const ACCESS_COOKIE_NAME = 'muhub_access';
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/**
 * Stateless session: the cookie holds an HMAC keyed by the password, so nothing is stored
 * server-side and changing ACCESS_PASSWORD signs every existing session out.
 */
function sessionToken() {
  return createHmac('sha256', environment.accessPassword).update('muhub-access-session').digest('base64url');
}

function equalsInConstantTime(left, right) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function readCookie(request, name) {
  const header = request.headers.cookie ?? '';
  for (const pair of header.split(';')) {
    const separatorIndex = pair.indexOf('=');
    if (separatorIndex > 0 && pair.slice(0, separatorIndex).trim() === name) return pair.slice(separatorIndex + 1).trim();
  }
  return undefined;
}

// Secure only over HTTPS (directly or behind a TLS proxy); a Secure cookie is never sent back over plain HTTP.
function isHttps(request) {
  return request.socket.encrypted === true || request.headers['x-forwarded-proto'] === 'https';
}

export function isAccessProtected() {
  return environment.accessPassword !== '';
}

export function hasAccess(request) {
  if (!isAccessProtected()) return true;
  const token = readCookie(request, ACCESS_COOKIE_NAME);
  return token !== undefined && equalsInConstantTime(token, sessionToken());
}

export function isAccessPassword(password) {
  return equalsInConstantTime(password, environment.accessPassword);
}

export function accessCookieHeader(request) {
  const attributes = [
    `${ACCESS_COOKIE_NAME}=${sessionToken()}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ];
  if (isHttps(request)) attributes.push('Secure');
  return attributes.join('; ');
}
