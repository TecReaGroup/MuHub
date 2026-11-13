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
    <header className="flex flex-col justify-between gap-4 border-b border-zinc-200/70 pb-10 sm:flex-row sm:items-center dark:border-zinc-800/70">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
        <p className="mt-1 text-sm font-light text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <SearchField value={query} onChange={onQueryChange} onSubmit={onQuerySubmit} />
        <PrimaryButton onClick={onAdd}>
          <Icon name="plus" className="size-4" />
          <span>收录</span>
        </PrimaryButton>
      </div>
    </header>
  );
}
