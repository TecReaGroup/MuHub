const listeners = new Set<() => void>();

/** Called by the API layer on any 401, e.g. after ACCESS_PASSWORD changes and signs every session out. */
export function notifyAccessRevoked() {
  listeners.forEach(listener => listener());
}

export function onAccessRevoked(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
