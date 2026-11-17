interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  label: string;
  options: SegmentedOption[];
  value: string;
  onChange: (option: string) => void;
}

// Below `md` the control is a borderless chip row inside the page gutter; from `md` up, a padded sunken track.
const TRACK_CLASS = 'min-w-0 max-w-full md:rounded-control md:bg-surface-sunken md:p-1';

// The vertical padding gives the chips' hit-area overlay room inside the scroller, which clips both axes.
const SCROLLER_CLASS = 'min-w-0 overflow-x-auto overscroll-x-contain py-1.5 [scrollbar-width:none] md:py-0 [&::-webkit-scrollbar]:hidden';

// Chips stay 32px tall visually; the ::after overlay extends the touch target to 44px (WCAG 2.5.5).
const OPTION_CLASS = [
  'relative inline-flex h-8 shrink-0 cursor-pointer items-center justify-center px-3.5 text-xs leading-5 font-medium whitespace-nowrap transition-[color,background-color,box-shadow]',
  'after:absolute after:inset-x-0 after:-inset-y-1.5 md:after:hidden',
  'rounded-full bg-surface-sunken text-fg-muted aria-selected:bg-accent aria-selected:text-on-accent',
  'md:rounded-tight md:bg-transparent md:px-3 md:hover:text-fg md:aria-selected:bg-surface md:aria-selected:text-fg md:aria-selected:shadow-rest',
].join(' ');

/** Single-choice filter: a scrolling chip row on phones, a segmented track on larger screens. */
export function SegmentedControl({ label, options, value, onChange }: SegmentedControlProps) {
  return (
    <div className={TRACK_CLASS}>
      <div className={SCROLLER_CLASS}>
        <div role="tablist" aria-label={label} className="flex w-max items-center gap-2 md:min-w-full md:justify-center md:gap-1">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={option.value === value}
              onClick={() => onChange(option.value)}
              className={OPTION_CLASS}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
