import { useCallback, useState } from 'react';
import { diagramClient, diagramMatchesQuery, EMPTY_DIAGRAM_DRAFT, toDiagramDraft, type Diagram, type DiagramDraft } from '../../entities/diagram/diagram';
import { DiagramCard } from '../../entities/diagram/DiagramCard';
import { DiagramFormModal } from '../../features/diagram-form/DiagramFormModal';
import { DiagramPreviewModal } from '../../features/diagram-preview/DiagramPreviewModal';
import { log, serializeError } from '../../shared/lib/logger';
import { useRemoteCollection } from '../../shared/lib/useRemoteCollection';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { EmptyNotice, SkeletonBlock } from '../../shared/ui/Placeholder';
import { Toast, useToast } from '../../shared/ui/Toast';
import { PageHeader } from './PageHeader';

const SKELETON_COUNT = 4;

interface EditorSession {
  open: boolean;
  target: Diagram | null;
  initialDraft: DiagramDraft;
}

interface DiagramSession {
  open: boolean;
  target: Diagram | null;
}

const CLOSED_SESSION: DiagramSession = { open: false, target: null };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误';
}

export function DiagramView() {
  const { items: diagrams, status, addItem, editItem, removeItem } = useRemoteCollection(diagramClient, 'Diagram');
  const { toast, showToast } = useToast();
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<EditorSession>({ open: false, target: null, initialDraft: EMPTY_DIAGRAM_DRAFT });
  const [preview, setPreview] = useState(CLOSED_SESSION);
  const [removal, setRemoval] = useState(CLOSED_SESSION);

  const visibleDiagrams = diagrams.filter(diagram => diagramMatchesQuery(diagram, query));

  const openCreator = () => setEditor({ open: true, target: null, initialDraft: EMPTY_DIAGRAM_DRAFT });
  const openEditor = useCallback((diagram: Diagram) => setEditor({ open: true, target: diagram, initialDraft: toDiagramDraft(diagram) }), []);
  const closeEditor = useCallback(() => setEditor(current => ({ ...current, open: false })), []);
  const openPreview = useCallback((diagram: Diagram) => setPreview({ open: true, target: diagram }), []);
  const closePreview = useCallback(() => setPreview(current => ({ ...current, open: false })), []);
  const askRemoval = useCallback((diagram: Diagram) => setRemoval({ open: true, target: diagram }), []);
  const closeRemoval = useCallback(() => setRemoval(current => ({ ...current, open: false })), []);

  async function saveDiagram(draft: DiagramDraft) {
    try {
      if (editor.target) {
        await editItem(editor.target.id, draft);
        showToast(`已更新「${draft.title}」`);
      } else {
        await addItem(draft);
        showToast(`已收录「${draft.title}」`);
      }
      closeEditor();
    } catch (error) {
      log('error', 'Diagram', 'Failed to save diagram', serializeError(error));
      showToast(`保存失败：${errorMessage(error)}`);
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
      log('error', 'Diagram', 'Failed to delete diagram', serializeError(error));
      showToast(`删除失败：${errorMessage(error)}`);
    }
  }

  function previewTopMatch() {
    const [topMatch] = visibleDiagrams;
    if (query.trim() && topMatch) openPreview(topMatch);
  }

  function renderDiagrams() {
    if (status === 'loading') {
      return Array.from({ length: SKELETON_COUNT }, (_, index) => <SkeletonBlock key={index} className="h-80 rounded-3xl" />);
    }
    if (status === 'unavailable') return <EmptyNotice>无法连接到服务，请确认后端已启动</EmptyNotice>;
    if (diagrams.length === 0) return <EmptyNotice>还没有收录任何架构图，点击「收录」开始吧</EmptyNotice>;
    if (visibleDiagrams.length === 0) return <EmptyNotice>未找到匹配的架构图</EmptyNotice>;
    return visibleDiagrams.map(diagram => (
      <DiagramCard key={diagram.id} diagram={diagram} onPreview={openPreview} onEdit={openEditor} onRemove={askRemoval} />
    ));
  }

  return (
    <>
      <PageHeader
        title="架构图"
        subtitle={`${diagrams.length} 张架构图，点击图纸可全屏查看`}
        query={query}
        onQueryChange={setQuery}
        onQuerySubmit={previewTopMatch}
        onAdd={openCreator}
      />

      <section className="grid animate-fade-up grid-cols-1 gap-6 pt-8 md:grid-cols-2">{renderDiagrams()}</section>

      <DiagramFormModal
        open={editor.open}
        heading={editor.target ? '编辑架构图' : '收录架构图'}
        initialDraft={editor.initialDraft}
        onSubmit={saveDiagram}
        onClose={closeEditor}
      />
      <DiagramPreviewModal open={preview.open} diagram={preview.target} onClose={closePreview} />
      <ConfirmDialog
        open={removal.open}
        title="删除架构图"
        message={`确定删除「${removal.target?.title ?? ''}」吗？此操作无法撤销。`}
        confirmLabel="删除"
        onConfirm={confirmRemoval}
        onClose={closeRemoval}
      />
      <Toast {...toast} />
    </>
  );
}
