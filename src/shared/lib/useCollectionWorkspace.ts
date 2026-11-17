import { useCallback, useState, useSyncExternalStore } from 'react';
import type { CollectionStore } from '../api/collection-store';
import { useI18n } from '../i18n/locale';
import { useToast } from '../ui/Toast';
import { placeId, type ItemPlacement } from './item-placement';
import { log, serializeError } from './logger';

interface WorkspaceOptions<Item, Draft> {
  /** Module-level constants only: identities must be stable across renders. */
  collection: CollectionStore<Item, Draft>;
  emptyDraft: Draft;
  toDraft: (item: Item) => Draft;
}

interface EditorState<Item, Draft> {
  open: boolean;
  /** null while creating; kept after close so the exit transition shows the same content. */
  target: Item | null;
  initialDraft: Draft;
}

interface RemovalState<Item> {
  open: boolean;
  target: Item | null;
}

/**
 * The full create/edit/remove workflow for one collection: dialog state, persistence,
 * success/failure toasts and error logging. Pages only render.
 */
export function useCollectionWorkspace<Item extends { id: string; title: string }, Draft extends { title: string }>(
  { collection, emptyDraft, toDraft }: WorkspaceOptions<Item, Draft>,
) {
  const { items, status } = useSyncExternalStore(collection.subscribe, collection.getSnapshot);
  const { moduleName } = collection;
  const showToast = useToast();
  const { text } = useI18n();
  const [editor, setEditor] = useState<EditorState<Item, Draft>>({ open: false, target: null, initialDraft: emptyDraft });
  const [removal, setRemoval] = useState<RemovalState<Item>>({ open: false, target: null });

  const openCreator = useCallback((prefill: Partial<Draft> = {}) => {
    setEditor({ open: true, target: null, initialDraft: { ...emptyDraft, ...prefill } });
  }, [emptyDraft]);
  const openEditor = useCallback((item: Item) => {
    setEditor({ open: true, target: item, initialDraft: toDraft(item) });
  }, [toDraft]);
  const closeEditor = useCallback(() => setEditor(current => ({ ...current, open: false })), []);
  const askRemoval = useCallback((item: Item) => setRemoval({ open: true, target: item }), []);
  const closeRemoval = useCallback(() => setRemoval(current => ({ ...current, open: false })), []);

  function failureReason(error: unknown): string {
    return error instanceof Error ? error.message : text['common.unknownError'];
  }

  async function saveDraft(draft: Draft) {
    try {
      if (editor.target) await collection.update(editor.target.id, draft);
      else await collection.create(draft);
      showToast(text['toast.saved'](draft.title));
      closeEditor();
    } catch (error) {
      log('error', moduleName, 'Failed to save item', serializeError(error));
      showToast(text['toast.saveFailed'](failureReason(error)));
    }
  }

  async function confirmRemoval() {
    const { target } = removal;
    if (!target) return;
    closeRemoval();
    try {
      await collection.remove(target.id);
      showToast(text['toast.deleted'](target.title));
    } catch (error) {
      log('error', moduleName, 'Failed to delete item', serializeError(error));
      showToast(text['toast.deleteFailed'](failureReason(error)));
    }
  }

  async function placeItem(placement: ItemPlacement) {
    try {
      await collection.reorder(placeId(items.map(item => item.id), placement));
    } catch (error) {
      log('error', moduleName, 'Failed to reorder items', serializeError(error));
      showToast(text['toast.reorderFailed'](failureReason(error)));
    }
  }

  return {
    items,
    status,
    openCreator,
    openEditor,
    askRemoval,
    placeItem,
    editor: { ...editor, close: closeEditor, save: saveDraft },
    removal: { ...removal, close: closeRemoval, confirm: confirmRemoval },
  };
}
