import { SearchField } from '../../features/search/SearchField';
import { PrimaryButton } from '../../shared/ui/Button';
import { Icon } from '../../shared/ui/Icon';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  query: string;
  onQueryChange: (query: string) => void;
  /** Enter in the search box; typically opens the top match. */
  onQuerySubmit: () => void;
  onAdd: () => void;
}

export function PageHeader({ title, subtitle, query, onQueryChange, onQuerySubmit, onAdd }: PageHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 border-b border-line pb-10 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="text-2xl font-medium tracking-tight text-fg">{title}</h1>
        <p className="mt-1 truncate text-sm font-light text-fg-muted">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <SearchField value={query} onChange={onQueryChange} onSubmit={onQuerySubmit} />
        <PrimaryButton onClick={onAdd}>
          <Icon name="plus" />
          <span>收录</span>
        </PrimaryButton>
      </div>
    </header>
  );
}
