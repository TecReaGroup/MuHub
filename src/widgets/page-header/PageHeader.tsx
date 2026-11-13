import { TEXT_ROLE } from '../../shared/ui/text-class';

interface PageHeaderProps {
  title: string;
  /** Short context shown inline after the title, e.g. the item count. */
  subtitle: string;
}

/** Title with inline meta. */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="flex min-w-0 items-baseline gap-3 pt-6 pb-5 md:pt-8 md:pb-6">
      <h1 className={`shrink-0 ${TEXT_ROLE.pageTitle}`}>{title}</h1>
      <p className={`truncate ${TEXT_ROLE.body}`}>{subtitle}</p>
    </header>
  );
}
