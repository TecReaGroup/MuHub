import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const TOAST_DURATION_MS = 2400;

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

/** Single app-wide toast slot; a new message replaces the current one. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState({ message: '', visible: false });
  const hideTimerRef = useRef<number>();

  const showToast = useCallback<ShowToast>(message => {
    window.clearTimeout(hideTimerRef.current);
    setToast({ message, visible: true });
    hideTimerRef.current = window.setTimeout(() => setToast(current => ({ ...current, visible: false })), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(hideTimerRef.current), []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed right-6 bottom-6 z-60 rounded-xl bg-accent px-4 py-2.5 text-xs font-medium text-on-accent shadow-lg transition-all duration-300 ease-out-expo ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      >
        {toast.message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error('useToast must be used inside <ToastProvider>');
  return showToast;
}
