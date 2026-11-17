import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useI18n } from '../i18n/locale';
import { IconButton } from './Button';
import { Icon } from './Icon';
import { TEXT_ROLE } from './text-class';

// Initial focus: explicit opt-in first, then the first text field, then the dialog itself.
const INITIAL_FOCUS_SELECTORS = ['[data-autofocus]', 'input, textarea'];

// Below md the panel spans the screen bottom edge; bottom padding clears the home indicator.
const SHEET_PANEL_CLASS = 'max-md:w-full max-md:rounded-b-none max-md:border-x-0 max-md:border-b-0 max-md:pt-7 max-md:pb-[max(1.25rem,env(safe-area-inset-bottom))]';

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
  /** Size and padding only, e.g. `w-[min(28rem,calc(100vw-1rem))] p-6`; below md it is overridden to a full-width sheet. */
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
      className="modal-dialog max-w-none overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-fg focus:outline-none"
    >
      <div className={`relative flex flex-col rounded-dialog border border-line bg-surface shadow-overlay ${className} ${SHEET_PANEL_CLASS}`}>
        <div aria-hidden className="absolute top-2 left-1/2 h-1 w-9 -translate-x-1/2 rounded-full bg-line md:hidden" />
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
    <DialogFrame open={open} onClose={onClose} labelledBy={titleId} className="w-[min(28rem,calc(100vw-1rem))] p-5 sm:p-6">
      <header className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
        <h2 id={titleId} className={TEXT_ROLE.dialogTitle}>{title}</h2>
        {/* Sheets dismiss via Cancel or the backdrop, matching platform bottom-sheet convention. */}
        <IconButton label={text['common.close']} onClick={onClose} className="-mr-2 max-md:hidden">
          <Icon name="close" />
        </IconButton>
      </header>
      {children}
    </DialogFrame>
  );
}

/**
 * Dialog footer: cancel on the left, confirm on the right. Expects a 1rem gap above it from its parent.
 * On phones the buttons split the sheet width so both are easy thumb targets.
 */
export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2 pt-2 max-sm:*:flex-1">{children}</div>;
}
