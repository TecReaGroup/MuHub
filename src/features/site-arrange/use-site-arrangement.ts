import { arrayMove } from '@dnd-kit/sortable';
import { siteCategories, siteCollection, toSiteDraft, type Site } from '../../entities/site/site';
import { useI18n } from '../../shared/i18n/locale';
import { placeId, type ItemPlacement } from '../../shared/lib/item-placement';
import { log, serializeError } from '../../shared/lib/logger';
import { useToast } from '../../shared/ui/Toast';

/**
 * Category order is derived from site order, so every arrangement saves the full site order
 * grouped by category; otherwise moving a category's first site would silently reorder categories.
 */
function groupIdsByCategory(ids: string[], categoryOf: (id: string) => string, categories: string[]): string[] {
  return categories.flatMap(category => ids.filter(id => categoryOf(id) === category));
}

/** Drag-and-drop arrangement of sites: moving a site (possibly into another category) and reordering categories. */
export function useSiteArrangement(sites: Site[]) {
  const showToast = useToast();
  const { text } = useI18n();
  const categoryById = new Map(sites.map(site => [site.id, site.category]));
  const siteIds = sites.map(site => site.id);

  async function persist(failureMessage: string, arrange: () => Promise<void>) {
    try {
      await arrange();
    } catch (error) {
      log('error', siteCollection.moduleName, failureMessage, serializeError(error));
      showToast(text['toast.reorderFailed'](error instanceof Error ? error.message : text['common.unknownError']));
    }
  }

  /** The placement's section id is the target category. */
  function moveSite(placement: ItemPlacement) {
    return persist('Failed to move site', async () => {
      const site = sites.find(candidate => candidate.id === placement.itemId);
      if (!site) return;
      const category = placement.sectionId;
      if (site.category !== category) {
        await siteCollection.update(site.id, { ...toSiteDraft(site), category });
        log('info', siteCollection.moduleName, 'Site moved to category', { id: site.id, category });
      }
      const categoryOf = (id: string) => (id === site.id ? category : categoryById.get(id)!);
      await siteCollection.reorder(groupIdsByCategory(placeId(siteIds, placement), categoryOf, siteCategories(sites)));
    });
  }

  function moveCategory(activeCategory: string, overCategory: string) {
    return persist('Failed to reorder categories', async () => {
      const categories = siteCategories(sites);
      const reordered = arrayMove(categories, categories.indexOf(activeCategory), categories.indexOf(overCategory));
      await siteCollection.reorder(groupIdsByCategory(siteIds, id => categoryById.get(id)!, reordered));
    });
  }

  return { moveSite, moveCategory };
}
