import { useId } from 'react';
import { DangerButton, GhostButton } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** Destructive confirmation; focus starts on Cancel so Enter never deletes by accident. */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const titleId = useId();
  return (
    <Modal open={open} title={title} titleId={titleId} onClose={onClose}>
      <p className="text-sm leading-relaxed font-light text-fg-muted">{message}</p>
      <div className="flex justify-end gap-2 pt-6">
        <GhostButton data-autofocus onClick={onClose}>取消</GhostButton>
        <DangerButton onClick={onConfirm}>{confirmLabel}</DangerButton>
      </div>
    </Modal>
  );
}
