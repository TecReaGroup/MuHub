import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useI18n } from '../../shared/i18n/locale';
import { SEARCH_FIELD_CLASS } from '../../shared/ui/control-class';
import { Icon } from '../../shared/ui/Icon';
import { Kbd } from '../../shared/ui/Kbd';
import { useSearchContext } from './search-context';

const FOCUS_SHORTCUT_KEY = '/';

// The shortcut must not fire while typing or while a dialog owns the keyboard.
function isShortcutBlocked(target: EventTarget | null): boolean {
  return target instanceof HTMLElement
    && target.closest('input, textarea, select, [contenteditable="true"], dialog, [role="dialog"]') !== null;
}

/** The global search box; the current page decides what Enter does via `usePageSearch`. */
export const SearchField = forwardRef<HTMLInputElement>(function SearchField(_, forwardedRef) {
  const { text } = useI18n();
  const { query, setQuery, submitRef } = useSearchContext();
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(forwardedRef, () => inputRef.current!);

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
    <div className="relative min-w-0">
      <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-fg-subtle" />
      <input
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        value={query}
        aria-label={text['common.search']}
        placeholder={text['common.searchPlaceholder']}
        onChange={event => setQuery(event.target.value)}
        onKeyDown={event => {
          // Enter that confirms an IME candidate must not submit.
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) submitRef.current();
          if (event.key === 'Escape') {
            setQuery('');
            event.currentTarget.blur();
          }
        }}
        className={`${SEARCH_FIELD_CLASS} pr-10 pl-11`}
      />
      {!query && (
        <Kbd className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 pointer-coarse:hidden">{FOCUS_SHORTCUT_KEY}</Kbd>
      )}
    </div>
  );
});
