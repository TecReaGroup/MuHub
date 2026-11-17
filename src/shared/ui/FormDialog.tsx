import type { FormEventHandler, ReactNode } from 'react';
import { useI18n } from '../i18n/locale';
import { Button, SubmitButton } from './Button';
import { Modal, ModalActions } from './Modal';

interface FormDialogProps {
  open: boolean;
  title: string;
  isSaving: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClose: () => void;
  children: ReactNode;
}

/** Owns the shared editing layout and localized submission actions. */
export function FormDialog({ open, title, isSaving, onSubmit, onClose, children }: FormDialogProps) {
  const { text } = useI18n();
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form autoComplete="off" onSubmit={onSubmit} className="space-y-4">
        {children}
        <ModalActions>
          <Button size="lg" className="mr-auto" onClick={onClose}>{text['common.cancel']}</Button>
          <SubmitButton pending={isSaving}>{text['common.save']}</SubmitButton>
        </ModalActions>
      </form>
    </Modal>
  );
}
