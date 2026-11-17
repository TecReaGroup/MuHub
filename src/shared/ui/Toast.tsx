import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const TOAST_DURATION_MS = 2400;

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

/** Single app-wide toast slot; a new message replaces the current one. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number>();

  const showToast = useCallback<ShowToast>(message => {
    // A manual popover lives in the top layer; re-showing it moves it above any open modal <dialog>.
    const toastElement = toastRef.current!;
    if (toastElement.matches(':popover-open')) toastElement.hidePopover();
    toastElement.showPopover();
    window.clearTimeout(hideTimerRef.current);
    setToast({ message, visible: true });
    hideTimerRef.current = window.setTimeout(() => setToast(current => ({ ...current, visible: false })), TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    // Set imperatively: React 18 does not know the `popover` attribute.
    toastRef.current!.setAttribute('popover', 'manual');
    return () => window.clearTimeout(hideTimerRef.current);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        ref={toastRef}
        role="status"
        aria-live="polite"
        className={`pointer-events-none inset-x-4 bottom-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom)+0.75rem)] mx-auto w-fit max-w-[min(24rem,calc(100vw-2rem))] rounded-control border-0 bg-accent px-4 py-2.5 text-center text-xs font-medium text-on-accent shadow-overlay transition-[opacity,translate] duration-medium starting:translate-y-2 starting:opacity-0 md:inset-x-auto md:right-6 md:bottom-6 md:mx-0 md:text-left ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
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
