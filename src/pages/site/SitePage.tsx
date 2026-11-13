import { useMemo, useState } from 'react';
import { EMPTY_SITE_DRAFT, siteClient, siteMatchesQuery, toSiteDraft } from '../../entities/site/site';
import { SiteCard } from '../../entities/site/SiteCard';
import { SiteFormModal } from '../../features/site-form/SiteFormModal';
import { useCollectionWorkspace } from '../../shared/lib/useCollectionWorkspace';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { PillTabs } from '../../shared/ui/PillTabs';
import { CollectionGrid } from '../../widgets/collection-grid/CollectionGrid';
import { PageHeader } from '../../widgets/page-header/PageHeader';
import { formatToday, greetingFor } from './greeting';

const ALL_CATEGORY = '全部';

export function SitePage() {
  const { items: sites, status, openCreator, openEditor, askRemoval, editor, removal } = useCollectionWorkspace({
    client: siteClient,
    emptyDraft: EMPTY_SITE_DRAFT,
    toDraft: toSiteDraft,
    moduleName: 'Site',
  });
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [query, setQuery] = useState('');
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
        title="导航"
        subtitle={`${greetingFor(now)} · ${formatToday(now)} · ${sites.length} 个网址`}
        query={query}
        onQueryChange={setQuery}
        onQuerySubmit={openTopMatch}
        onAdd={() => openCreator(activeCategory === ALL_CATEGORY ? {} : { category: activeCategory })}
      />

      <div className="space-y-6 pt-8">
        {categories.length > 0 && (
          <PillTabs label="分类" options={[ALL_CATEGORY, ...categories]} value={activeCategory} onChange={setSelectedCategory} />
        )}
        <CollectionGrid
          key={activeCategory}
          status={status}
          totalCount={sites.length}
          visibleItems={visibleSites}
          noun="网址"
          layoutClassName="grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          skeletonClassName="h-44"
          skeletonCount={6}
          renderItem={site => <SiteCard site={site} onEdit={openEditor} onRemove={askRemoval} />}
        />
      </div>

      <SiteFormModal
        open={editor.open}
        heading={editor.target ? '编辑网址' : '收录网址'}
        initialDraft={editor.initialDraft}
        categories={categories}
        onSubmit={editor.save}
        onClose={editor.close}
      />
      <ConfirmDialog
        open={removal.open}
        title="删除网址"
        message={`确定删除「${removal.target?.title ?? ''}」吗？此操作无法撤销。`}
        confirmLabel="删除"
        onConfirm={removal.confirm}
        onClose={removal.close}
      />
    </>
  );
}
