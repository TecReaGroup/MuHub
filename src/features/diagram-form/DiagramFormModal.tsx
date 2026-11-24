import { useMemo } from 'react';
import type { DiagramDraft } from '../../entities/diagram/diagram';
import { DiagramImage } from '../../entities/diagram/DiagramImage';
import { useI18n } from '../../shared/i18n/locale';
import { useDraftForm } from '../../shared/lib/useDraftForm';
import { FormDialog } from '../../shared/ui/FormDialog';
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
  // `open` and `imageUrl` are deliberate triggers: each open or pasted URL re-fetches, since editing exists to pick up a re-export.
  const previewRevision = useMemo(() => String(Date.now()), [open, imageUrl]);

  return (
    <FormDialog open={open} title={heading} isSaving={isSaving} onSubmit={submit} onClose={onClose}>
        <MonoTextField
          label={text['diagram.imageUrl']}
          required
          placeholder={text['diagram.imageUrlPlaceholder']}
          {...bindField('imageUrl')}
        />
        {imageUrl && (
          <div className="rounded-control border border-line bg-diagram-canvas p-3">
            <DiagramImage src={imageUrl} revision={previewRevision} alt={text['diagram.imagePreview']} className="max-h-40 w-full object-contain" />
          </div>
        )}
        <TextField label={text['common.title']} required maxLength={80} placeholder={text['diagram.titlePlaceholder']} {...bindField('title')} />
        <TextAreaField label={text['common.optionalDescription']} rows={4} maxLength={1000} placeholder={text['diagram.descriptionPlaceholder']} {...bindField('description')} />
    </FormDialog>
  );
}
