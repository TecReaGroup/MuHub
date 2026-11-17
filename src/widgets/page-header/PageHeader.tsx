import type { ReactNode } from 'react';
import { TEXT_ROLE } from '../../shared/ui/text-class';

interface PageHeaderProps {
  title: string;
  /** Short context shown inline after the title, e.g. the item count. */
  subtitle: ReactNode;
  /** Controls pinned with the title, e.g. filters. */
  toolbar?: ReactNode;
}

/** Title with inline meta, pinned to the top of the scrolling page. */
export function PageHeader({ title, subtitle, toolbar }: PageHeaderProps) {
  return (
    // z-30 clears cards' z-10 layers and dragged cards' z-20. The spread shadow paints the canvas
    // into <main>'s side gutters (clip-path trims it vertically), so scrolled content never peeks out beside the header.
    // The background fades out over the bottom padding, so content dissolves under the header instead of being cut;
    // the fade stays within that padding, so it never covers content at rest.
    <div className="sticky top-0 z-30 bg-[linear-gradient(to_bottom,var(--canvas)_calc(100%-1rem),transparent)] shadow-[0_0_0_100vmax_var(--canvas)] [clip-path:inset(0_-100vmax)]">
      <header className="flex min-w-0 items-baseline gap-3 pt-4 pb-4 sm:gap-5 sm:pt-6 sm:pb-5 md:pt-8 md:pb-6">
        <h1 className={`shrink-0 ${TEXT_ROLE.pageTitle}`}>{title}</h1>
        <p className={`min-w-0 truncate ${TEXT_ROLE.pageSubtitle}`}>{subtitle}</p>
      </header>
      {toolbar && <div className="flex flex-wrap items-center gap-3 pb-4 sm:pb-6">{toolbar}</div>}
    </div>
  );
}
