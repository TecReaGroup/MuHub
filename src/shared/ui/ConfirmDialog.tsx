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

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const titleId = useId();
  return (
    <Modal open={open} title={title} titleId={titleId} onClose={onClose}>
      <p className="text-sm font-light leading-relaxed text-zinc-500 dark:text-zinc-400">{message}</p>
      <div className="flex justify-end gap-2 pt-6">
        <GhostButton onClick={onClose}>取消</GhostButton>
        <DangerButton onClick={onConfirm}>{confirmLabel}</DangerButton>
      </div>
    </Modal>
  );
}
