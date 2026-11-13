import { useEffect, useRef } from 'react';
import { Icon } from '../../shared/ui/Icon';
import { Kbd } from '../../shared/ui/Kbd';

const FOCUS_SHORTCUT_KEY = '/';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired on Enter, e.g. to open the top match. */
  onSubmit: () => void;
}

// The shortcut must not fire while typing or while a dialog owns the keyboard.
function isShortcutBlocked(target: EventTarget | null): boolean {
  return target instanceof HTMLElement
    && target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]') !== null;
}

export function SearchField({ value, onChange, onSubmit }: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function focusOnShortcut(event: KeyboardEvent) {
      if (event.key !== FOCUS_SHORTCUT_KEY || isShortcutBlocked(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener('keydown', focusOnShortcut);
    return () => window.removeEventListener('keydown', focusOnShortcut);
  }, []);

  return (
    <div className="relative min-w-0 flex-1 sm:flex-none">
      <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        aria-label="搜索"
        placeholder="搜索..."
        onChange={event => onChange(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') onSubmit();
          if (event.key === 'Escape') {
            onChange('');
            event.currentTarget.blur();
          }
        }}
        className="w-full rounded-xl border border-line bg-surface py-2 pr-9 pl-9 text-sm text-fg transition-colors duration-150 placeholder:text-fg-subtle focus:border-line-strong focus:outline-none sm:w-56"
      />
      {!value && (
        <Kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">{FOCUS_SHORTCUT_KEY}</Kbd>
      )}
    </div>
  );
}
