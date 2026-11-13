import { useCallback, useState } from 'react';
import { useToast } from '../ui/Toast';
import type { CollectionClient } from './collection-client';
import { log, serializeError } from './logger';
import { useRemoteCollection } from './useRemoteCollection';

interface WorkspaceOptions<Item, Draft> {
  /** Module-level constants only: identities must be stable across renders. */
  client: CollectionClient<Item, Draft>;
  emptyDraft: Draft;
  toDraft: (item: Item) => Draft;
  moduleName: string;
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

function failureReason(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误';
}

/**
 * The full create/edit/remove workflow for one collection: dialog state, persistence,
 * success/failure toasts and error logging. Pages only render.
 */
export function useCollectionWorkspace<Item extends { id: string; title: string }, Draft extends { title: string }>(
  { client, emptyDraft, toDraft, moduleName }: WorkspaceOptions<Item, Draft>,
) {
  const { items, status, addItem, editItem, removeItem } = useRemoteCollection(client, moduleName);
  const showToast = useToast();
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

  async function saveDraft(draft: Draft) {
    try {
      if (editor.target) await editItem(editor.target.id, draft);
      else await addItem(draft);
      showToast(`已保存「${draft.title}」`);
      closeEditor();
    } catch (error) {
      log('error', moduleName, 'Failed to save item', serializeError(error));
      showToast(`保存失败：${failureReason(error)}`);
    }
  }

  async function confirmRemoval() {
    const { target } = removal;
    if (!target) return;
    closeRemoval();
    try {
      await removeItem(target.id);
      showToast(`已删除「${target.title}」`);
    } catch (error) {
      log('error', moduleName, 'Failed to delete item', serializeError(error));
      showToast(`删除失败：${failureReason(error)}`);
    }
  }

  return {
    items,
    status,
    openCreator,
    openEditor,
    askRemoval,
    editor: { ...editor, close: closeEditor, save: saveDraft },
    removal: { ...removal, close: closeRemoval, confirm: confirmRemoval },
  };
}
