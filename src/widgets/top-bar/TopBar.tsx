import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { LocaleSwitch } from '../../features/locale-switch/LocaleSwitch';
import { SearchField } from '../../features/search/SearchField';
import { useSearchContext } from '../../features/search/search-context';
import { useI18n } from '../../shared/i18n/locale';
import { RouteLink } from '../../shared/router/RouteLink';
import { Button } from '../../shared/ui/Button';
import { APP_BAR_ACTION_CLASS } from '../../shared/ui/control-class';
import { Icon } from '../../shared/ui/Icon';

const SEARCH_PANEL_ID = 'top-bar-search';

function Brand({ className }: { className: string }) {
  return (
    <RouteLink href="/" aria-label="MuHub" className={`flex items-center gap-2.5 justify-self-start rounded-control ${className}`}>
      <img src="/favicon.svg" alt="" className="size-8 shrink-0" />
      <span className="text-lg font-semibold tracking-tight">
        <span className="text-fg">Mu</span>
        <span className="font-normal text-fg-muted">Hub</span>
      </span>
    </RouteLink>
  );
}

/**
 * Full-width app bar: brand left, global search centered, app-level controls right.
 * Below `md` the search hides behind a toggle; opening it replaces the whole bar with field + Cancel.
 */
export function TopBar() {
  const { text } = useI18n();
  const { setQuery } = useSearchContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const hiddenWhileSearching = isSearchOpen ? 'max-md:hidden' : '';

  function openSearch() {
    // Focus inside the tap handler: iOS only raises the keyboard for focus within a user gesture.
    flushSync(() => setIsSearchOpen(true));
    searchInputRef.current?.focus();
  }

  // A hidden field must not keep filtering the page, so dismissing the search also clears the query.
  function closeSearch() {
    flushSync(() => {
      setQuery('');
      setIsSearchOpen(false);
    });
    searchToggleRef.current?.focus();
  }

  return (
    // Side columns match the sidebar width on desktop so the search stays centered over the whole window.
    // z-30 keeps the locale menu above <main>, whose fade-in transform opens its own stacking context.
    <header className="relative z-30 grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-line bg-canvas px-4 md:grid-cols-[14rem_minmax(0,1fr)_14rem]">
      <Brand className={hiddenWhileSearching} />
      <div
        id={SEARCH_PANEL_ID}
        className={`${isSearchOpen ? 'flex animate-fade-in' : 'hidden'} col-span-full mx-auto w-full max-w-xl items-center gap-1 md:col-span-1 md:flex md:animate-none`}
        onKeyDown={event => {
          if (event.key === 'Escape' && isSearchOpen) closeSearch();
        }}
      >
        <div className="min-w-0 flex-1">
          <SearchField ref={searchInputRef} />
        </div>
        <Button tone="ghost" size="lg" onClick={closeSearch} className="-mr-2 md:hidden">
          {text['common.cancel']}
        </Button>
      </div>
      <div className={`flex items-center justify-end gap-1 md:gap-0 ${hiddenWhileSearching}`}>
        <button
          ref={searchToggleRef}
          type="button"
          aria-label={text['common.search']}
          title={text['common.search']}
          aria-controls={SEARCH_PANEL_ID}
          onClick={openSearch}
          className={`${APP_BAR_ACTION_CLASS} md:hidden`}
        >
          <Icon name="search" />
        </button>
        <LocaleSwitch />
      </div>
    </header>
  );
}
