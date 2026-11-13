interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div role="tablist" aria-label="分类" className="flex items-center gap-2 overflow-x-auto pb-2">
      {categories.map(category => {
        const isActive = category === activeCategory;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(category)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
