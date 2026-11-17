import { notifyAccessRevoked } from './access-revocation';

// Fails a hung request instead of leaving the UI in a loading state forever.
const REQUEST_TIMEOUT_MS = 15_000;

/** A non-2xx backend response; `message` is the backend's `{ error }` text when present. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly requestId: string | undefined;

  constructor(message: string, statusCode: number, requestId: string | undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.requestId = requestId;
  }
}

/**
 * The single fetch entry point for the backend JSON API.
 * Uses the default HTTP cache mode, so ETag revalidation (304) is handled by the browser.
 */
export async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    if (response.status === 401) notifyAccessRevoked();
    const failure = await response.json().catch(() => null) as { error?: string } | null;
    throw new ApiError(
      failure?.error ?? `HTTP ${response.status}`,
      response.status,
      response.headers.get('X-Request-Id') ?? undefined,
    );
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}
