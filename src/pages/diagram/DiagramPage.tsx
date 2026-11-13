import { useCallback, useState } from 'react';
import { diagramClient, diagramMatchesQuery, EMPTY_DIAGRAM_DRAFT, toDiagramDraft, type Diagram } from '../../entities/diagram/diagram';
import { DiagramCard, DiagramCardSkeleton } from '../../entities/diagram/DiagramCard';
import { DiagramFormModal } from '../../features/diagram-form/DiagramFormModal';
import { DiagramPreviewModal } from '../../features/diagram-preview/DiagramPreviewModal';
import { usePageAddAction } from '../../features/add-action/add-action-context';
import { usePageSearch } from '../../features/search/search-context';
import { useI18n } from '../../shared/i18n/locale';
import { useCollectionWorkspace } from '../../shared/lib/useCollectionWorkspace';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { CollectionGrid } from '../../widgets/collection-grid/CollectionGrid';
import { PageHeader } from '../../widgets/page-header/PageHeader';

export function DiagramPage() {
  const { text } = useI18n();
  const { items: diagrams, status, openCreator, openEditor, askRemoval, editor, removal } = useCollectionWorkspace({
    client: diagramClient,
    emptyDraft: EMPTY_DIAGRAM_DRAFT,
    toDraft: toDiagramDraft,
    moduleName: 'Diagram',
  });
  const query = usePageSearch(previewTopMatch);
  usePageAddAction(openCreator);
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
        title={text['diagram.pageTitle']}
        subtitle={text['diagram.subtitle'](diagrams.length)}
      />

      <CollectionGrid
        status={status}
        totalCount={diagrams.length}
        visibleItems={visibleDiagrams}
        noun={text['diagram.noun']}
        layoutClassName="grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-3"
        skeleton={<DiagramCardSkeleton />}
        skeletonCount={4}
        renderItem={diagram => (
          <DiagramCard diagram={diagram} onPreview={openPreview} onEdit={openEditor} onRemove={askRemoval} />
        )}
      />

      <DiagramFormModal
        open={editor.open}
        heading={editor.target ? text['diagram.editHeading'] : text['diagram.createHeading']}
        initialDraft={editor.initialDraft}
        onSubmit={editor.save}
        onClose={editor.close}
      />
      <DiagramPreviewModal open={preview.open} diagram={preview.target} onClose={closePreview} />
      <ConfirmDialog
        open={removal.open}
        title={text['diagram.deleteHeading']}
        message={text['common.confirmDelete'](removal.target?.title ?? '')}
        confirmLabel={text['common.delete']}
        onConfirm={removal.confirm}
        onClose={removal.close}
      />
    </>
  );
}
