import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { SortableBoard, type BoardSection } from '../../features/item-sort/SortableBoard';
import { useI18n } from '../../shared/i18n/locale';
import type { CollectionStatus } from '../../shared/api/collection-store';
import type { ItemPlacement } from '../../shared/lib/item-placement';
import { EmptyNotice, ErrorBanner } from '../../shared/ui/Placeholder';

// Fast loads finish before this, so they never flash a skeleton.
const SKELETON_DELAY_MS = 200;

interface CollectionGridProps<Item extends { id: string }> {
  status: CollectionStatus;
  totalCount: number;
  /** Empty sections are hidden. */
  visibleSections: BoardSection<Item>[];
  /** Localized item noun used in empty-state copy, e.g. "sites". */
  noun: string;
  /** Grid columns and gap. */
  layoutClassName: string;
  /** One placeholder shaped exactly like a real item. */
  skeleton: ReactNode;
  /** Enough to fill the first screen, not the real item count. */
  skeletonCount: number;
  onMoveItem: (placement: ItemPlacement) => Promise<void>;
  onMoveSection?: (activeSectionId: string, overSectionId: string) => Promise<void>;
  renderItem: (item: Item) => ReactNode;
}

function useDelayedFlag(isActive: boolean, delayMs: number): boolean {
  const [isDue, setIsDue] = useState(false);
  useEffect(() => {
    if (!isActive) {
      setIsDue(false);
      return;
    }
    const timer = window.setTimeout(() => setIsDue(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [isActive, delayMs]);
  return isDue;
}

/** Renders the loading / unavailable / empty / no-match / sectioned list states with one consistent look. */
export function CollectionGrid<Item extends { id: string }>({
  status,
  totalCount,
  visibleSections,
  noun,
  layoutClassName,
  skeleton,
  skeletonCount,
  onMoveItem,
  onMoveSection,
  renderItem,
}: CollectionGridProps<Item>) {
  const { text } = useI18n();
  const isSkeletonDue = useDelayedFlag(status === 'loading', SKELETON_DELAY_MS);
  const filledSections = visibleSections.filter(section => section.items.length > 0);

  if (status === 'loading') {
    return (
      <div aria-busy="true" className={`grid ${layoutClassName}`}>
        <span className="sr-only">{text['common.loading']}</span>
        {isSkeletonDue && Array.from({ length: skeletonCount }, (_, index) => <Fragment key={index}>{skeleton}</Fragment>)}
      </div>
    );
  }
  if (status === 'unavailable') return <ErrorBanner>{text['collection.unavailable']}</ErrorBanner>;
  if (totalCount === 0) return <EmptyNotice>{text['collection.empty'](noun)}</EmptyNotice>;
  if (filledSections.length === 0) return <EmptyNotice>{text['collection.noMatch'](noun)}</EmptyNotice>;

  return (
    <div className="animate-fade-in">
      <SortableBoard
        sections={filledSections}
        layoutClassName={layoutClassName}
        renderItem={renderItem}
        onMoveItem={onMoveItem}
        onMoveSection={onMoveSection}
      />
    </div>
  );
}
