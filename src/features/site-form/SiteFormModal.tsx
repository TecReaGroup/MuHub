import { siteHostname, type SiteDraft } from '../../entities/site/site';
import { useI18n } from '../../shared/i18n/locale';
import { useDraftForm } from '../../shared/lib/useDraftForm';
import { Button, SubmitButton } from '../../shared/ui/Button';
import { ComboboxField } from '../../shared/ui/ComboboxField';
import { Modal, ModalActions } from '../../shared/ui/Modal';
import { MonoTextField, TextAreaField, TextField } from '../../shared/ui/TextField';

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
  const { text } = useI18n();
  const { draft, setDraft, bindField, isSaving, submit } = useDraftForm(open, initialDraft, onSubmit);

  function fillTitleFromUrl() {
    if (draft.title.trim() || !draft.url.trim()) return;
    setDraft(current => ({ ...current, title: suggestTitle(current.url) }));
  }

  return (
    <Modal open={open} title={heading} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <MonoTextField label={text['site.url']} type="url" required placeholder="https://linear.app" onBlur={fillTitleFromUrl} {...bindField('url')} />
        <TextField label={text['common.title']} required maxLength={60} placeholder={text['site.titlePlaceholder']} {...bindField('title')} />
        <ComboboxField
          label={text['site.category']}
          required
          maxLength={20}
          options={categories}
          placeholder={text['site.categoryPlaceholder']}
          value={draft.category}
          onChange={category => setDraft(current => ({ ...current, category }))}
        />
        <TextAreaField label={text['common.optionalDescription']} rows={2} maxLength={200} placeholder={text['site.descriptionPlaceholder']} {...bindField('description')} />
        <ModalActions>
          <Button size="lg" onClick={onClose}>{text['common.cancel']}</Button>
          <SubmitButton pending={isSaving}>{text['common.save']}</SubmitButton>
        </ModalActions>
      </form>
    </Modal>
  );
}
