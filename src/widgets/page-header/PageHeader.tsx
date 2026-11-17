import type { ReactNode } from 'react';
import { TEXT_ROLE } from '../../shared/ui/text-class';

interface PageHeaderProps {
  title: string;
  /** Short context shown inline after the title, e.g. the item count. */
  subtitle: ReactNode;
}

/** Title with inline meta. */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="flex min-w-0 items-baseline gap-3 pt-4 pb-4 sm:gap-5 sm:pt-6 sm:pb-5 md:pt-8 md:pb-6">
      <h1 className={`shrink-0 ${TEXT_ROLE.pageTitle}`}>{title}</h1>
      <p className={`min-w-0 truncate ${TEXT_ROLE.pageSubtitle}`}>{subtitle}</p>
    </header>
  );
}
