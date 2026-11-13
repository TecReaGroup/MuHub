import { useMemo, useState } from 'react';
import { EMPTY_SITE_DRAFT, siteClient, siteMatchesQuery, toSiteDraft } from '../../entities/site/site';
import { SiteCard, SiteCardSkeleton } from '../../entities/site/SiteCard';
import { usePageAddAction } from '../../features/add-action/add-action-context';
import { usePageSearch } from '../../features/search/search-context';
import { SiteFormModal } from '../../features/site-form/SiteFormModal';
import { useI18n } from '../../shared/i18n/locale';
import { useCollectionWorkspace } from '../../shared/lib/useCollectionWorkspace';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { SegmentedControl } from '../../shared/ui/SegmentedControl';
import { CollectionGrid } from '../../widgets/collection-grid/CollectionGrid';
import { PageHeader } from '../../widgets/page-header/PageHeader';
import { formatToday, greetingKeyFor } from './greeting';

// Sentinel, never a real category: the form requires a non-empty one.
const ALL_CATEGORY = '';

export function SitePage() {
  const { locale, text } = useI18n();
  const { items: sites, status, openCreator, openEditor, askRemoval, editor, removal } = useCollectionWorkspace({
    client: siteClient,
    emptyDraft: EMPTY_SITE_DRAFT,
    toDraft: toSiteDraft,
    moduleName: 'Site',
  });
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const query = usePageSearch(openTopMatch);
  usePageAddAction(() => openCreator(activeCategory === ALL_CATEGORY ? {} : { category: activeCategory }));
  const [now] = useState(() => new Date());

  // Categories appear in the order their first site does.
  const categories = useMemo(() => [...new Set(sites.map(site => site.category))], [sites]);
  // Falls back to "all" once the selected category loses its last site.
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : ALL_CATEGORY;
  const visibleSites = sites.filter(site =>
    (activeCategory === ALL_CATEGORY || site.category === activeCategory) && siteMatchesQuery(site, query));

  function openTopMatch() {
    const [topMatch] = visibleSites;
    if (query.trim() && topMatch) window.open(topMatch.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <PageHeader
        title={text['site.pageTitle']}
        subtitle={`${text['site.count'](sites.length)} · ${text[greetingKeyFor(now)]} · ${formatToday(now, locale)}`}
      />

      <div className="flex flex-col items-start gap-6">
        {categories.length > 0 && (
          <SegmentedControl
            label={text['site.category']}
            options={[{ value: ALL_CATEGORY, label: text['site.allCategory'] }, ...categories.map(category => ({ value: category, label: category }))]}
            value={activeCategory}
            onChange={setSelectedCategory}
          />
        )}
        <CollectionGrid
          key={activeCategory}
          status={status}
          totalCount={sites.length}
          visibleItems={visibleSites}
          noun={text['site.noun']}
          layoutClassName="w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
          skeleton={<SiteCardSkeleton />}
          skeletonCount={6}
          renderItem={site => <SiteCard site={site} onEdit={openEditor} onRemove={askRemoval} />}
        />
      </div>

      <SiteFormModal
        open={editor.open}
        heading={editor.target ? text['site.editHeading'] : text['site.createHeading']}
        initialDraft={editor.initialDraft}
        categories={categories}
        onSubmit={editor.save}
        onClose={editor.close}
      />
      <ConfirmDialog
        open={removal.open}
        title={text['site.deleteHeading']}
        message={text['common.confirmDelete'](removal.target?.title ?? '')}
        confirmLabel={text['common.delete']}
        onConfirm={removal.confirm}
        onClose={removal.close}
      />
    </>
  );
}
