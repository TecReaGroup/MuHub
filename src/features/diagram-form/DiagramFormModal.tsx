import { useId } from 'react';
import type { DiagramDraft } from '../../entities/diagram/diagram';
import { DiagramImage } from '../../entities/diagram/DiagramImage';
import { useDraftForm } from '../../shared/lib/useDraftForm';
import { GhostButton, PrimaryButton } from '../../shared/ui/Button';
import { Modal } from '../../shared/ui/Modal';
import { TextAreaField, TextField } from '../../shared/ui/TextField';

interface DiagramFormModalProps {
  open: boolean;
  heading: string;
  initialDraft: DiagramDraft;
  /** Must resolve even on failure; the caller owns error reporting. */
  onSubmit: (draft: DiagramDraft) => Promise<void>;
  onClose: () => void;
}

export function DiagramFormModal({ open, heading, initialDraft, onSubmit, onClose }: DiagramFormModalProps) {
  const { draft, bindField, isSaving, submit } = useDraftForm(open, initialDraft, onSubmit);
  const titleId = useId();
  const imageUrl = draft.imageUrl.trim();

  return (
    <Modal open={open} title={heading} titleId={titleId} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField
          label="SVG 图片链接"
          required
          placeholder="https://example.com/arch.svg 或 /diagram/arch.svg"
          {...bindField('imageUrl')}
        />
        {imageUrl && (
          <div className="rounded-xl border border-line bg-diagram-canvas p-3">
            <DiagramImage src={imageUrl} alt="预览" className="max-h-40 w-full object-contain" />
          </div>
        )}
        <TextField label="标题" required maxLength={80} placeholder="例如：订单系统架构" {...bindField('title')} />
        <TextAreaField label="描述（可选）" rows={4} maxLength={1000} placeholder="说明架构的核心思路与权衡…" {...bindField('description')} />
        <div className="flex justify-end gap-2 pt-3">
          <GhostButton onClick={onClose}>取消</GhostButton>
          <PrimaryButton type="submit" disabled={isSaving}>{isSaving ? '保存中…' : '保存'}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
