import { useCallback, useState } from 'react';
import { diagramClient, diagramMatchesQuery, EMPTY_DIAGRAM_DRAFT, toDiagramDraft, type Diagram } from '../../entities/diagram/diagram';
import { DiagramCard } from '../../entities/diagram/DiagramCard';
import { DiagramFormModal } from '../../features/diagram-form/DiagramFormModal';
import { DiagramPreviewModal } from '../../features/diagram-preview/DiagramPreviewModal';
import { useCollectionWorkspace } from '../../shared/lib/useCollectionWorkspace';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { CollectionGrid } from '../../widgets/collection-grid/CollectionGrid';
import { PageHeader } from '../../widgets/page-header/PageHeader';

export function DiagramPage() {
  const { items: diagrams, status, openCreator, openEditor, askRemoval, editor, removal } = useCollectionWorkspace({
    client: diagramClient,
    emptyDraft: EMPTY_DIAGRAM_DRAFT,
    toDraft: toDiagramDraft,
    moduleName: 'Diagram',
  });
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<{ open: boolean; target: Diagram | null }>({ open: false, target: null });

  const visibleDiagrams = diagrams.filter(diagram => diagramMatchesQuery(diagram, query));
  const openPreview = useCallback((diagram: Diagram) => setPreview({ open: true, target: diagram }), []);
  const closePreview = useCallback(() => setPreview(current => ({ ...current, open: false })), []);

  function previewTopMatch() {
    const [topMatch] = visibleDiagrams;
    if (query.trim() && topMatch) openPreview(topMatch);
  }

  return (
    <>
      <PageHeader
        title="架构图"
        subtitle={`${diagrams.length} 张架构图，点击图纸可全屏查看`}
        query={query}
        onQueryChange={setQuery}
        onQuerySubmit={previewTopMatch}
        onAdd={() => openCreator()}
      />

      <div className="pt-8">
        <CollectionGrid
          status={status}
          totalCount={diagrams.length}
          visibleItems={visibleDiagrams}
          noun="架构图"
          layoutClassName="grid-cols-1 gap-6 md:grid-cols-2"
          skeletonClassName="h-80"
          skeletonCount={4}
          renderItem={diagram => (
            <DiagramCard diagram={diagram} onPreview={openPreview} onEdit={openEditor} onRemove={askRemoval} />
          )}
        />
      </div>

      <DiagramFormModal
        open={editor.open}
        heading={editor.target ? '编辑架构图' : '收录架构图'}
        initialDraft={editor.initialDraft}
        onSubmit={editor.save}
        onClose={editor.close}
      />
      <DiagramPreviewModal open={preview.open} diagram={preview.target} onClose={closePreview} />
      <ConfirmDialog
        open={removal.open}
        title="删除架构图"
        message={`确定删除「${removal.target?.title ?? ''}」吗？此操作无法撤销。`}
        confirmLabel="删除"
        onConfirm={removal.confirm}
        onClose={removal.close}
      />
    </>
  );
}
