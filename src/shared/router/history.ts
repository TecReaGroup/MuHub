import { useSyncExternalStore } from 'react';

// pushState/replaceState fire no event, so in-app navigation announces itself alongside popstate.
const NAVIGATE_EVENT = 'muhub:navigate';

function subscribeToLocation(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

export function usePathname(): string {
  return useSyncExternalStore(subscribeToLocation, () => window.location.pathname);
}

/** Adds a history entry, so back returns to the current page. */
export function navigate(path: string) {
  if (path === window.location.pathname) return;
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/** Swaps the current entry, for URLs that should never be returned to (e.g. `/` or unknown paths). */
export function redirect(path: string) {
  window.history.replaceState(null, '', path);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}
