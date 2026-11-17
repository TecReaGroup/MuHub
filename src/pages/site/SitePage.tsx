import { useMemo, useState } from 'react';
import { EMPTY_SITE_DRAFT, siteCategories, siteCollection, siteMatchesQuery, toSiteDraft } from '../../entities/site/site';
import { SiteCard, SiteCardSkeleton } from '../../entities/site/SiteCard';
import { usePageAddAction } from '../../features/add-action/add-action-context';
import { usePageSearch } from '../../features/search/search-context';
import { useSiteArrangement } from '../../features/site-arrange/use-site-arrangement';
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
    collection: siteCollection,
    emptyDraft: EMPTY_SITE_DRAFT,
    toDraft: toSiteDraft,
  });
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const query = usePageSearch(openTopMatch);
  usePageAddAction(() => openCreator(activeCategory === ALL_CATEGORY ? {} : { category: activeCategory }));
  const [now] = useState(() => new Date());
  const { moveSite, moveCategory } = useSiteArrangement(sites);

  const categories = useMemo(() => siteCategories(sites), [sites]);
  // Falls back to "all" once the selected category loses its last site.
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : ALL_CATEGORY;
  const matchingSites = sites.filter(site => siteMatchesQuery(site, query));
  const visibleSections = (activeCategory === ALL_CATEGORY ? categories : [activeCategory]).map(category => ({
    id: category,
    title: category,
    items: matchingSites.filter(site => site.category === category),
  }));

  function openTopMatch() {
    const [topMatch] = visibleSections.flatMap(section => section.items);
    if (query.trim() && topMatch) window.open(topMatch.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <PageHeader
        title={text['site.pageTitle']}
        subtitle={<>
          {text['site.count'](sites.length)} · {text[greetingKeyFor(now)]}
          <span className="hidden sm:inline"> · {formatToday(now, locale)}</span>
        </>}
        toolbar={categories.length > 0 && (
          <SegmentedControl
            label={text['site.category']}
            options={[{ value: ALL_CATEGORY, label: text['site.allCategory'] }, ...categories.map(category => ({ value: category, label: category }))]}
            value={activeCategory}
            onChange={setSelectedCategory}
          />
        )}
      />

      <CollectionGrid
        status={status}
        totalCount={sites.length}
        visibleSections={visibleSections}
        noun={text['site.noun']}
        layoutClassName="grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        skeleton={<SiteCardSkeleton />}
        skeletonCount={6}
        onMoveItem={moveSite}
        onMoveSection={moveCategory}
        renderItem={site => <SiteCard site={site} onEdit={openEditor} onRemove={askRemoval} />}
      />

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
