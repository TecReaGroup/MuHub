import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_DURATION_MS = 2400;

interface ToastState {
  message: string;
  visible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });
  const hideTimerRef = useRef<number>();

  const showToast = useCallback((message: string) => {
    window.clearTimeout(hideTimerRef.current);
    setToast({ message, visible: true });
    hideTimerRef.current = window.setTimeout(() => setToast(current => ({ ...current, visible: false })), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(hideTimerRef.current), []);

  return { toast, showToast };
}

export function Toast({ message, visible }: ToastState) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed right-6 bottom-6 z-50 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg transition-all duration-300 dark:bg-zinc-100 dark:text-zinc-900 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      {message}
    </div>
  );
}
