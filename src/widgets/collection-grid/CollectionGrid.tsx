import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { useI18n } from '../../shared/i18n/locale';
import type { CollectionStatus } from '../../shared/lib/useRemoteCollection';
import { EmptyNotice, ErrorBanner } from '../../shared/ui/Placeholder';

// Fast loads finish before this, so they never flash a skeleton.
const SKELETON_DELAY_MS = 200;

interface CollectionGridProps<Item extends { id: string }> {
  status: CollectionStatus;
  totalCount: number;
  visibleItems: Item[];
  /** Localized item noun used in empty-state copy, e.g. "sites". */
  noun: string;
  /** Grid columns and gap. */
  layoutClassName: string;
  /** One placeholder shaped exactly like a real item. */
  skeleton: ReactNode;
  /** Enough to fill the first screen, not the real item count. */
  skeletonCount: number;
  toolbar?: ReactNode;
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

/** Renders the loading / unavailable / empty / no-match / list states with one consistent look. */
export function CollectionGrid<Item extends { id: string }>({
  status,
  totalCount,
  visibleItems,
  noun,
  layoutClassName,
  skeleton,
  skeletonCount,
  toolbar,
  renderItem,
}: CollectionGridProps<Item>) {
  const { text } = useI18n();
  const isSkeletonDue = useDelayedFlag(status === 'loading', SKELETON_DELAY_MS);

  function renderBody() {
    if (status === 'loading') {
      return (
        <>
          <span className="sr-only">{text['common.loading']}</span>
          {isSkeletonDue && Array.from({ length: skeletonCount }, (_, index) => <Fragment key={index}>{skeleton}</Fragment>)}
        </>
      );
    }
    if (status === 'unavailable') return <ErrorBanner>{text['collection.unavailable']}</ErrorBanner>;
    if (totalCount === 0) return <EmptyNotice>{text['collection.empty'](noun)}</EmptyNotice>;
    if (visibleItems.length === 0) return <EmptyNotice>{text['collection.noMatch'](noun)}</EmptyNotice>;
    return visibleItems.map(item => <Fragment key={item.id}>{renderItem(item)}</Fragment>);
  }

  return (
    <section className="w-full space-y-6">
      {toolbar && <div className="flex flex-wrap items-center gap-3">{toolbar}</div>}
      <div aria-busy={status === 'loading'} className={`grid ${status === 'loading' ? '' : 'animate-fade-in'} ${layoutClassName}`}>
        {renderBody()}
      </div>
    </section>
  );
}
