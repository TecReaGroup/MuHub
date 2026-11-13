import { useEffect, type ReactNode } from 'react';
import { IconButton } from './Button';
import { Icon } from './Icon';

interface ModalOverlayProps {
  open: boolean;
  onClose: () => void;
  /** The dialog panel; it sizes itself. */
  children: ReactNode;
}

/** Backdrop with Escape/outside-click close. Stays mounted while closed so the exit transition can play. */
export function ModalOverlay({ open, onClose, children }: ModalOverlayProps) {
  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  return (
    <div
      role="presentation"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/30 p-4 backdrop-blur-sm transition-all duration-200 md:p-8 dark:bg-black/60 ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
    >
      {/* Pass-through wrapper: clicks beside the panel still reach the backdrop. */}
      <div className={`pointer-events-none flex w-full justify-center transition-transform duration-200 *:pointer-events-auto ${open ? 'scale-100' : 'scale-95'}`}>
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
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-7 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id={titleId} className="text-base font-medium text-zinc-900 dark:text-zinc-100">{title}</h2>
          <IconButton label="关闭" onClick={onClose} className="-mr-2">
            <Icon name="close" className="size-5" />
          </IconButton>
        </div>
        {children}
      </div>
    </ModalOverlay>
  );
}
