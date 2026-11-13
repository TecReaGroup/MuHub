import { useEffect, useRef } from 'react';
import { Icon } from '../../shared/ui/Icon';

const FOCUS_SHORTCUT_KEY = '/';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired on Enter, e.g. to open the top match. */
  onSubmit: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement
    && target.closest('input, textarea, select, [contenteditable="true"]') !== null;
}

export function SearchField({ value, onChange, onSubmit }: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function focusOnShortcut(event: KeyboardEvent) {
      if (event.key !== FOCUS_SHORTCUT_KEY || isEditableTarget(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener('keydown', focusOnShortcut);
    return () => window.removeEventListener('keydown', focusOnShortcut);
  }, []);

  return (
    <div className="relative">
      <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        aria-label="筛选"
        placeholder="筛选..."
        onChange={event => onChange(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') onSubmit();
          if (event.key === 'Escape') {
            onChange('');
            event.currentTarget.blur();
          }
        }}
        className="w-44 rounded-xl border border-zinc-200/80 bg-white py-2 pr-9 pl-9 text-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none sm:w-56 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
      />
      {!value && (
        <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-zinc-200 px-1.5 font-sans text-[10px] leading-4 text-zinc-400 dark:border-zinc-700">
          {FOCUS_SHORTCUT_KEY}
        </kbd>
      )}
    </div>
  );
}
