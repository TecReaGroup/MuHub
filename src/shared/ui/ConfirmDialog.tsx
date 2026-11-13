import { useId } from 'react';
import { useI18n } from '../i18n/locale';
import { Button } from './Button';
import { Icon } from './Icon';
import { DialogFrame, ModalActions } from './Modal';
import { TEXT_ROLE } from './text-class';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Should name the affected object. */
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** Irreversible-delete confirmation; focus starts on Cancel so Enter never deletes by accident. */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const { text } = useI18n();
  const titleId = useId();
  const messageId = useId();
  return (
    <DialogFrame
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={messageId}
      className="w-[min(25rem,calc(100vw-2rem))] p-6"
    >
      <div className="mb-4 flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
          <Icon name="alertTriangle" className="size-5" />
        </div>
        <div className="min-w-0 space-y-1.5 pt-1">
          <h2 id={titleId} className={TEXT_ROLE.dialogTitle}>{title}</h2>
          <p id={messageId} className={`${TEXT_ROLE.body} break-words`}>{message}</p>
        </div>
      </div>
      <ModalActions>
        <Button size="lg" data-autofocus onClick={onClose}>{text['common.cancel']}</Button>
        <Button tone="danger" size="lg" onClick={onConfirm}>{confirmLabel}</Button>
      </ModalActions>
    </DialogFrame>
  );
}
