import { useCallback, useMemo, useState } from 'react';
import { EMPTY_SITE_DRAFT, siteClient, siteMatchesQuery, toSiteDraft, type Site, type SiteDraft } from '../../entities/site/site';
import { SiteCard } from '../../entities/site/SiteCard';
import { SiteFormModal } from '../../features/site-form/SiteFormModal';
import { log, serializeError } from '../../shared/lib/logger';
import { useRemoteCollection } from '../../shared/lib/useRemoteCollection';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { EmptyNotice, SkeletonBlock } from '../../shared/ui/Placeholder';
import { Toast, useToast } from '../../shared/ui/Toast';
import { CategoryTabs } from './CategoryTabs';
import { formatToday, greetingFor } from './greeting';
import { PageHeader } from './PageHeader';

const ALL_CATEGORY = '全部';
const SKELETON_COUNT = 6;

interface EditorSession {
  open: boolean;
  target: Site | null;
  initialDraft: SiteDraft;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误';
}

export function SiteView() {
  const { items: sites, status, addItem, editItem, removeItem } = useRemoteCollection(siteClient, 'Site');
  const { toast, showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<EditorSession>({ open: false, target: null, initialDraft: EMPTY_SITE_DRAFT });
  const [removal, setRemoval] = useState<{ open: boolean; target: Site | null }>({ open: false, target: null });
  const [now] = useState(() => new Date());

  // Categories appear in the order their first site does.
  const categories = useMemo(() => [...new Set(sites.map(site => site.category))], [sites]);
  // Falls back to "all" once the selected category loses its last site.
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : ALL_CATEGORY;
  const visibleSites = sites.filter(site =>
    (activeCategory === ALL_CATEGORY || site.category === activeCategory) && siteMatchesQuery(site, query));

  const openCreator = () => setEditor({
    open: true,
    target: null,
    initialDraft: { ...EMPTY_SITE_DRAFT, category: activeCategory === ALL_CATEGORY ? '' : activeCategory },
  });
  const openEditor = useCallback((site: Site) => setEditor({ open: true, target: site, initialDraft: toSiteDraft(site) }), []);
  const closeEditor = useCallback(() => setEditor(current => ({ ...current, open: false })), []);
  const askRemoval = useCallback((site: Site) => setRemoval({ open: true, target: site }), []);
  const closeRemoval = useCallback(() => setRemoval(current => ({ ...current, open: false })), []);

  async function saveSite(draft: SiteDraft) {
    try {
      if (editor.target) {
        await editItem(editor.target.id, draft);
        showToast(`已更新「${draft.title}」`);
      } else {
        await addItem(draft);
        showToast(`已收录至「${draft.category}」`);
      }
      closeEditor();
    } catch (error) {
      log('error', 'Site', 'Failed to save site', serializeError(error));
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
      log('error', 'Site', 'Failed to delete site', serializeError(error));
      showToast(`删除失败：${errorMessage(error)}`);
    }
  }

  function openTopMatch() {
    const [topMatch] = visibleSites;
    if (query.trim() && topMatch) window.open(topMatch.url, '_blank', 'noopener,noreferrer');
  }

  function renderSites() {
    if (status === 'loading') {
      return Array.from({ length: SKELETON_COUNT }, (_, index) => <SkeletonBlock key={index} className="h-44" />);
    }
    if (status === 'unavailable') return <EmptyNotice>无法连接到服务，请确认后端已启动</EmptyNotice>;
    if (sites.length === 0) return <EmptyNotice>还没有收录任何网址，点击「收录」开始吧</EmptyNotice>;
    if (visibleSites.length === 0) return <EmptyNotice>未找到匹配的网址</EmptyNotice>;
    return visibleSites.map(site => <SiteCard key={site.id} site={site} onEdit={openEditor} onRemove={askRemoval} />);
  }

  return (
    <>
      <PageHeader
        title="导航"
        subtitle={`${greetingFor(now)} · ${formatToday(now)} · ${sites.length} 个网址`}
        query={query}
        onQueryChange={setQuery}
        onQuerySubmit={openTopMatch}
        onAdd={openCreator}
      />

      <div className="space-y-8 pt-8">
        {categories.length > 0 && (
          <CategoryTabs categories={[ALL_CATEGORY, ...categories]} activeCategory={activeCategory} onSelect={setSelectedCategory} />
        )}
        <section key={activeCategory} className="grid animate-fade-up grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {renderSites()}
        </section>
      </div>

      <SiteFormModal
        open={editor.open}
        heading={editor.target ? '编辑网址' : '收录新网址'}
        initialDraft={editor.initialDraft}
        categories={categories}
        onSubmit={saveSite}
        onClose={closeEditor}
      />
      <ConfirmDialog
        open={removal.open}
        title="删除网址"
        message={`确定删除「${removal.target?.title ?? ''}」吗？此操作无法撤销。`}
        confirmLabel="删除"
        onConfirm={confirmRemoval}
        onClose={closeRemoval}
      />
      <Toast {...toast} />
    </>
  );
}
