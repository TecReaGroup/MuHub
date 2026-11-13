import { useEffect, useRef, type ReactNode } from 'react';
import { IconButton } from './Button';
import { Icon } from './Icon';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
// Initial focus order: explicit opt-in, then the first text field, then anything focusable.
const INITIAL_FOCUS_SELECTORS = ['[data-autofocus]', 'input, textarea', FOCUSABLE_SELECTOR];

function focusInitialElement(panel: HTMLElement) {
  for (const selector of INITIAL_FOCUS_SELECTORS) {
    const element = panel.querySelector<HTMLElement>(selector);
    if (element) {
      element.focus();
      return;
    }
  }
}

function trapTab(event: KeyboardEvent, panel: HTMLElement) {
  const focusables = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

interface ModalOverlayProps {
  open: boolean;
  onClose: () => void;
  /** The dialog panel; it sizes itself. */
  children: ReactNode;
}

/**
 * Backdrop shared by every dialog. While open it locks page scroll, moves focus inside,
 * keeps Tab within the panel, closes on Escape/outside click, and restores focus on close.
 * It stays mounted while closed so the exit transition can play.
 */
export function ModalOverlay({ open, onClose, children }: ModalOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Read through a ref so a new onClose identity does not re-run the focus effect.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => focusInitialElement(panel));

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current();
      else if (event.key === 'Tab' && panel) trapTab(event, panel);
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  return (
    <div
      role="presentation"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-sm transition-all duration-200 md:p-8 ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
    >
      {/* Pass-through wrapper: clicks beside the panel still reach the backdrop. */}
      <div
        ref={panelRef}
        className={`pointer-events-none flex w-full justify-center transition-transform duration-200 ease-out-expo *:pointer-events-auto ${open ? 'scale-100' : 'scale-95'}`}
      >
        {children}
      </div>
    </div>
  );
}

interface ModalProps {
  open: boolean;
  title: string;
  titleId: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, titleId, onClose, children }: ModalProps) {
  return (
    <ModalOverlay open={open} onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl border border-line bg-surface p-7 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id={titleId} className="text-base font-medium text-fg">{title}</h2>
          <IconButton label="关闭" onClick={onClose} className="-mr-2">
            <Icon name="close" className="size-5" />
          </IconButton>
        </div>
        {children}
      </div>
    </ModalOverlay>
  );
}
