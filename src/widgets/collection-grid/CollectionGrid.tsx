import { Fragment, type ReactNode } from 'react';
import type { CollectionStatus } from '../../shared/lib/useRemoteCollection';
import { EmptyNotice, SkeletonBlock } from '../../shared/ui/Placeholder';

interface CollectionGridProps<Item extends { id: string }> {
  status: CollectionStatus;
  totalCount: number;
  visibleItems: Item[];
  /** Item noun used in empty-state copy, e.g. "网址". */
  noun: string;
  /** Grid columns and gap. */
  layoutClassName: string;
  skeletonClassName: string;
  skeletonCount: number;
  renderItem: (item: Item) => ReactNode;
}

/** Renders the loading / unavailable / empty / no-match / list states with one consistent look. */
export function CollectionGrid<Item extends { id: string }>({
  status,
  totalCount,
  visibleItems,
  noun,
  layoutClassName,
  skeletonClassName,
  skeletonCount,
  renderItem,
}: CollectionGridProps<Item>) {
  function renderBody() {
    if (status === 'loading') {
      return Array.from({ length: skeletonCount }, (_, index) => <SkeletonBlock key={index} className={skeletonClassName} />);
    }
    if (status === 'unavailable') return <EmptyNotice>无法连接到服务，请确认后端已启动</EmptyNotice>;
    if (totalCount === 0) return <EmptyNotice>{`还没有收录任何${noun}，点击「收录」开始吧`}</EmptyNotice>;
    if (visibleItems.length === 0) return <EmptyNotice>{`未找到匹配的${noun}`}</EmptyNotice>;
    return visibleItems.map(item => <Fragment key={item.id}>{renderItem(item)}</Fragment>);
  }

  return <section className={`grid animate-fade-up ${layoutClassName}`}>{renderBody()}</section>;
}
