export interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  label: string;
  options: SegmentedOption[];
  value: string;
  onChange: (option: string) => void;
}

/** Categories scroll inside a padded sunken track. */
export function SegmentedControl({ label, options, value, onChange }: SegmentedControlProps) {
  return (
    <div className="min-w-0 max-w-full rounded-control bg-surface-sunken p-1">
      <div className="min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div role="tablist" aria-label={label} className="flex w-max min-w-full items-center justify-center gap-1">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={option.value === value}
              onClick={() => onChange(option.value)}
              className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-tight px-3 py-0 text-center text-xs leading-5 font-medium whitespace-nowrap text-fg-muted transition-[color,background-color,box-shadow] hover:text-fg aria-selected:bg-surface aria-selected:text-fg aria-selected:shadow-rest pointer-coarse:h-10"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
