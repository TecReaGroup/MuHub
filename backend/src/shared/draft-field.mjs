import { HttpError } from './http.mjs';

const URL_MAX_LENGTH = 2048;

export function assertJsonObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Body must be a JSON object');
  }
}

export function readText(body, field, maxLength) {
  const value = body[field] ?? '';
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be a string`);
  const text = value.trim();
  if (text.length > maxLength) throw new HttpError(400, `${field} exceeds ${maxLength} characters`);
  return text;
}

export function readRequiredText(body, field, maxLength) {
  const text = readText(body, field, maxLength);
  if (!text) throw new HttpError(400, `${field} is required`);
  return text;
}

export function readWebUrl(body, field) {
  const text = readRequiredText(body, field, URL_MAX_LENGTH);
  let url;
  try {
    url = new URL(text);
  } catch {
    throw new HttpError(400, `${field} is not a valid address`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new HttpError(400, `${field} must use http or https`);
  }
  return url.href;
}

/** Accepts an http(s) URL or a same-origin path such as `/diagram/a.svg`. */
export function readWebOrRootPath(body, field) {
  const text = readRequiredText(body, field, URL_MAX_LENGTH);
  // "//host" is protocol-relative, i.e. another origin, so only a single leading slash counts as a path.
  if (text.startsWith('/') && !text.startsWith('//')) return text;
  return readWebUrl(body, field);
}
