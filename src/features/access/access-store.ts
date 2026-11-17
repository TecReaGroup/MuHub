import { useSyncExternalStore } from 'react';
import { onAccessRevoked } from '../../shared/api/access-revocation';
import { API_ENDPOINT } from '../../shared/api/api-endpoint';
import { ApiError, requestJson } from '../../shared/api/request-json';
import { log, serializeError } from '../../shared/lib/logger';

// `?access=<password>` lets a shared link sign in without the form.
const ACCESS_LINK_PARAM = 'access';

export type AccessStatus = 'checking' | 'locked' | 'granted';
export type LoginOutcome = 'granted' | 'wrongPassword' | 'unreachable';

const listeners = new Set<() => void>();
let status: AccessStatus = 'checking';
let hasStartedCheck = false;

function publish(next: AccessStatus) {
  status = next;
  listeners.forEach(notify => notify());
}

onAccessRevoked(() => publish('locked'));

/** Reads the link password and strips it from the URL so it stays out of history and screenshots. */
function takeLinkPassword(): string | null {
  const url = new URL(window.location.href);
  const password = url.searchParams.get(ACCESS_LINK_PARAM);
  if (password === null) return null;
  url.searchParams.delete(ACCESS_LINK_PARAM);
  window.history.replaceState(window.history.state, '', url);
  return password;
}

export async function login(password: string): Promise<LoginOutcome> {
  try {
    await requestJson<void>(API_ENDPOINT.authLogin, { method: 'POST', body: JSON.stringify({ password }) });
    log('info', 'Access', 'Login succeeded');
    publish('granted');
    return 'granted';
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) return 'wrongPassword';
    log('error', 'Access', 'Login request failed', serializeError(error));
    return 'unreachable';
  }
}

async function hasSession(): Promise<boolean> {
  try {
    await requestJson<void>(API_ENDPOINT.authSession);
    return true;
  } catch (error) {
    if (!(error instanceof ApiError && error.statusCode === 401)) log('error', 'Access', 'Session check failed', serializeError(error));
    return false;
  }
}

async function checkInitialAccess() {
  const linkPassword = takeLinkPassword();
  // A stale link must not lock out a browser that already holds a valid session.
  if (linkPassword && await login(linkPassword) === 'granted') return;
  publish(await hasSession() ? 'granted' : 'locked');
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Started on first subscribe (not import) and only once, so StrictMode's double mount cannot log in twice.
  if (!hasStartedCheck) {
    hasStartedCheck = true;
    void checkInitialAccess();
  }
  return () => listeners.delete(onChange);
}

export function useAccessStatus(): AccessStatus {
  return useSyncExternalStore(subscribe, () => status);
}
