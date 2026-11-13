import { useEffect, useId, useRef } from 'react';
import { siteHostname, type SiteDraft } from '../../entities/site/site';
import { useDraftForm } from '../../shared/lib/useDraftForm';
import { GhostButton, PrimaryButton } from '../../shared/ui/Button';
import { Modal } from '../../shared/ui/Modal';
import { TextAreaField, TextField } from '../../shared/ui/TextField';

interface SiteFormModalProps {
  open: boolean;
  heading: string;
  initialDraft: SiteDraft;
  categories: string[];
  /** Must resolve even on failure; the caller owns error reporting. */
  onSubmit: (draft: SiteDraft) => Promise<void>;
  onClose: () => void;
}

// "github.com" -> "Github"; only a starting point the user can overwrite.
function suggestTitle(url: string): string {
  const name = siteHostname(url).split('.')[0] ?? '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function SiteFormModal({ open, heading, initialDraft, categories, onSubmit, onClose }: SiteFormModalProps) {
  const { draft, setDraft, bindField, isSaving, submit } = useDraftForm(open, initialDraft, onSubmit);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const categoryListId = useId();

  useEffect(() => {
    if (open) requestAnimationFrame(() => urlInputRef.current?.focus());
  }, [open]);

  function fillTitleFromUrl() {
    if (draft.title.trim() || !draft.url.trim()) return;
    setDraft(current => ({ ...current, title: suggestTitle(current.url) }));
  }

  return (
    <Modal open={open} title={heading} titleId={titleId} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField
          ref={urlInputRef}
          label="网址"
          type="url"
          required
          placeholder="https://linear.app"
          onBlur={fillTitleFromUrl}
          {...bindField('url')}
        />
        <TextField label="标题" required maxLength={60} placeholder="例如：Linear" {...bindField('title')} />
        <TextField
          label="分类"
          required
          maxLength={20}
          list={categoryListId}
          placeholder="选择已有分类或输入新分类"
          {...bindField('category')}
        />
        <datalist id={categoryListId}>
          {categories.map(category => <option key={category} value={category} />)}
        </datalist>
        <TextAreaField
          label="描述（可选）"
          rows={2}
          maxLength={200}
          placeholder="一句话描述它的价值…"
          {...bindField('description')}
        />
        <div className="flex justify-end gap-2 pt-3">
          <GhostButton onClick={onClose}>取消</GhostButton>
          <PrimaryButton type="submit" disabled={isSaving}>{isSaving ? '保存中…' : '保存'}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
