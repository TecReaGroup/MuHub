import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

/**
 * Form state for a flat string draft: resets to `initialDraft` on every open
 * and submits a trimmed copy. `onSubmit` must resolve even on failure.
 */
export function useDraftForm<Draft extends Record<string, string>>(
  open: boolean,
  initialDraft: Draft,
  onSubmit: (draft: Draft) => Promise<void>,
) {
  const [draft, setDraft] = useState(initialDraft);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) setDraft(initialDraft);
  }, [open, initialDraft]);

  function bindField(field: keyof Draft & string) {
    return {
      value: draft[field],
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(current => ({ ...current, [field]: event.target.value })),
    };
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    const trimmedDraft = Object.fromEntries(Object.entries(draft).map(([field, value]) => [field, value.trim()])) as Draft;
    await onSubmit(trimmedDraft);
    setIsSaving(false);
  }

  return { draft, setDraft, bindField, isSaving, submit };
}
