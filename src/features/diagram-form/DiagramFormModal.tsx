import type { DiagramDraft } from '../../entities/diagram/diagram';
import { DiagramImage } from '../../entities/diagram/DiagramImage';
import { useI18n } from '../../shared/i18n/locale';
import { useDraftForm } from '../../shared/lib/useDraftForm';
import { Button, SubmitButton } from '../../shared/ui/Button';
import { Modal, ModalActions } from '../../shared/ui/Modal';
import { MonoTextField, TextAreaField, TextField } from '../../shared/ui/TextField';

interface DiagramFormModalProps {
  open: boolean;
  heading: string;
  initialDraft: DiagramDraft;
  /** Must resolve even on failure; the caller owns error reporting. */
  onSubmit: (draft: DiagramDraft) => Promise<void>;
  onClose: () => void;
}

export function DiagramFormModal({ open, heading, initialDraft, onSubmit, onClose }: DiagramFormModalProps) {
  const { text } = useI18n();
  const { draft, bindField, isSaving, submit } = useDraftForm(open, initialDraft, onSubmit);
  const imageUrl = draft.imageUrl.trim();

  return (
    <Modal open={open} title={heading} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <MonoTextField
          label={text['diagram.imageUrl']}
          required
          placeholder={text['diagram.imageUrlPlaceholder']}
          {...bindField('imageUrl')}
        />
        {imageUrl && (
          <div className="rounded-control border border-line bg-diagram-canvas p-3">
            <DiagramImage src={imageUrl} alt={text['diagram.imagePreview']} className="max-h-40 w-full object-contain" />
          </div>
        )}
        <TextField label={text['common.title']} required maxLength={80} placeholder={text['diagram.titlePlaceholder']} {...bindField('title')} />
        <TextAreaField label={text['common.optionalDescription']} rows={4} maxLength={1000} placeholder={text['diagram.descriptionPlaceholder']} {...bindField('description')} />
        <ModalActions>
          <Button size="lg" onClick={onClose}>{text['common.cancel']}</Button>
          <SubmitButton pending={isSaving}>{text['common.save']}</SubmitButton>
        </ModalActions>
      </form>
    </Modal>
  );
}
