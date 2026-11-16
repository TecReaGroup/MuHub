import { useEffect, useRef, useState } from 'react';

const SCROLL_IDLE_DELAY_MS = 800;

/** Shares scroll visibility and timer cleanup across semantic scroll containers. */
export function useScrollbar() {
  const [isScrolling, setIsScrolling] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  return {
    'data-scrolling': isScrolling,
    onScroll: () => {
      setIsScrolling(true);
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIsScrolling(false), SCROLL_IDLE_DELAY_MS);
    },
  };
}
