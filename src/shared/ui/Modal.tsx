import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useI18n } from '../i18n/locale';
import { IconButton } from './Button';
import { Icon } from './Icon';
import { TEXT_ROLE } from './text-class';

// Initial focus: explicit opt-in first, then the first text field, then the dialog itself.
const INITIAL_FOCUS_SELECTORS = ['[data-autofocus]', 'input, textarea'];

function focusInitialElement(dialog: HTMLDialogElement) {
  // On touch devices, focusing a text input immediately pops the virtual keyboard over the dialog.
  if (window.matchMedia('(pointer: coarse)').matches) {
    dialog.focus();
    return;
  }
  for (const selector of INITIAL_FOCUS_SELECTORS) {
    const element = dialog.querySelector<HTMLElement>(selector);
    if (element) {
      element.focus();
      return;
    }
  }
  dialog.focus();
}

interface DialogFrameProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  /** Size and padding only, e.g. `w-[min(28rem,calc(100vw-2rem))] p-6`. */
  className: string;
  children: ReactNode;
}

/**
 * Native modal <dialog>: top layer, focus containment, Escape and focus restore come from the platform.
 * The element stays mounted while closed so the exit transition can play.
 */
export function DialogFrame({ open, onClose, labelledBy, describedBy, className, children }: DialogFrameProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressStartedOnBackdropRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current!;
    if (open && !dialog.open) {
      dialog.showModal();
      focusInitialElement(dialog);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current!;
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateViewport = () => {
      dialog.style.setProperty('--visual-viewport-height', `${viewport.height}px`);
      dialog.style.setProperty('--visual-viewport-top', `${viewport.offsetTop}px`);
      if (dialog.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
        document.activeElement.scrollIntoView({ block: 'nearest' });
      }
    };
    updateViewport();
    viewport.addEventListener('resize', updateViewport);
    viewport.addEventListener('scroll', updateViewport);
    return () => {
      viewport.removeEventListener('resize', updateViewport);
      viewport.removeEventListener('scroll', updateViewport);
    };
  }, [open]);

  return (
    // The dialog box has no padding of its own, so a click targeting it can only be the ::backdrop.
    // Requiring the press to start there too keeps a text-selection drag from closing it.
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClose={() => open && onClose()}
      onMouseDown={event => { pressStartedOnBackdropRef.current = event.target === event.currentTarget; }}
      onClick={event => {
        if (pressStartedOnBackdropRef.current && event.target === event.currentTarget) onClose();
      }}
      className="modal-dialog m-auto max-w-none overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-fg focus:outline-none"
    >
      <div className={`flex flex-col rounded-dialog border border-line bg-surface shadow-overlay ${className}`}>
        {children}
      </div>
    </dialog>
  );
}

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Standard titled dialog with a close button. */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const { text } = useI18n();
  const titleId = useId();
  return (
    <DialogFrame open={open} onClose={onClose} labelledBy={titleId} className="w-[min(28rem,calc(100vw-1.5rem))] p-4 sm:w-[min(28rem,calc(100vw-2rem))] sm:p-6">
      <header className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
        <h2 id={titleId} className={TEXT_ROLE.dialogTitle}>{title}</h2>
        <IconButton label={text['common.close']} onClick={onClose} className="-mr-2">
          <Icon name="close" />
        </IconButton>
      </header>
      {children}
    </DialogFrame>
  );
}

/** Dialog footer: cancel on the left, confirm on the right. Expects a 1rem gap above it from its parent. */
export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2 pt-2">{children}</div>;
}
