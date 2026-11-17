import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { LocaleSwitch } from '../../features/locale-switch/LocaleSwitch';
import { SearchField } from '../../features/search/SearchField';
import { useSearchContext } from '../../features/search/search-context';
import { useI18n } from '../../shared/i18n/locale';
import { APP_BAR_ACTION_CLASS } from '../../shared/ui/control-class';
import { Icon } from '../../shared/ui/Icon';

const SEARCH_PANEL_ID = 'top-bar-search';

function Brand() {
  return (
    <a href="#" aria-label="MuHub" className="flex items-center gap-2.5 justify-self-start rounded-control">
      <img src="/favicon.svg" alt="" className="size-8 shrink-0" />
      <span className="text-lg font-semibold tracking-tight">
        <span className="text-fg">Mu</span>
        <span className="font-normal text-fg-muted">Hub</span>
      </span>
    </a>
  );
}

/**
 * Full-width app bar: brand left, global search centered, app-level controls right.
 * Below `md` the search collapses behind a toggle and opens as a second row.
 */
export function TopBar() {
  const { text } = useI18n();
  const { setQuery } = useSearchContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);

  // A hidden field must not keep filtering the page, so dismissing the panel also clears the query.
  function closeSearch() {
    setQuery('');
    setIsSearchOpen(false);
  }

  function openSearch() {
    // Focus inside the tap handler: iOS only raises the keyboard for focus within a user gesture.
    flushSync(() => setIsSearchOpen(true));
    searchInputRef.current?.focus();
  }

  return (
    // Side columns match the sidebar width on desktop so the search stays centered over the whole window.
    <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-line bg-canvas/90 px-4 py-1.5 backdrop-blur-md md:h-14 md:grid-cols-[14rem_minmax(0,1fr)_14rem] md:py-0">
      <Brand />
      <div
        id={SEARCH_PANEL_ID}
        className={`${isSearchOpen ? 'block animate-fade-in' : 'hidden'} order-last col-span-2 mx-auto w-full max-w-xl pt-1.5 pb-1 md:order-none md:col-span-1 md:block md:animate-none md:p-0`}
        onKeyDown={event => {
          if (event.key !== 'Escape' || !isSearchOpen) return;
          closeSearch();
          searchToggleRef.current?.focus();
        }}
      >
        <SearchField ref={searchInputRef} />
      </div>
      <div className="flex items-center justify-end gap-1 md:gap-0">
        <button
          ref={searchToggleRef}
          type="button"
          aria-label={text['common.search']}
          title={text['common.search']}
          aria-expanded={isSearchOpen}
          aria-controls={SEARCH_PANEL_ID}
          onClick={isSearchOpen ? closeSearch : openSearch}
          className={`${APP_BAR_ACTION_CLASS} md:hidden`}
        >
          <Icon name={isSearchOpen ? 'close' : 'search'} />
        </button>
        <LocaleSwitch />
      </div>
    </header>
  );
}
