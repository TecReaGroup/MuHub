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

/** Mutually exclusive choice on a sunken track; the selected segment rises to the surface. */
export function SegmentedControl({ label, options, value, onChange }: SegmentedControlProps) {
  return (
    // Wraps instead of scrolling sideways when there are many options.
    <div role="tablist" aria-label={label} className="inline-flex max-w-full flex-wrap gap-0.5 rounded-control bg-surface-sunken p-1">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className="h-7 rounded-tight px-3 text-xs font-medium whitespace-nowrap text-fg-muted transition-[color,background-color,box-shadow] hover:text-fg aria-selected:bg-surface aria-selected:text-fg aria-selected:shadow-rest"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
