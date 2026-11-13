interface PillTabsProps {
  label: string;
  options: string[];
  value: string;
  onChange: (option: string) => void;
}

export function PillTabs({ label, options, value, onChange }: PillTabsProps) {
  return (
    <div role="tablist" aria-label={label} className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 py-1">
      {options.map(option => {
        const isActive = option === value;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
              isActive ? 'bg-accent text-on-accent' : 'text-fg-muted hover:bg-hover hover:text-fg'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
