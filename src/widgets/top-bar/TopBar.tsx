import { LocaleSwitch } from '../../features/locale-switch/LocaleSwitch';
import { SearchField } from '../../features/search/SearchField';

function Brand() {
  return (
    <a href="#" aria-label="MuHub" className="flex items-center gap-2.5 rounded-control">
      <img src="/favicon.svg" alt="" className="size-8 shrink-0" />
      <span className="text-lg font-semibold tracking-tight max-sm:hidden">
        <span className="text-fg">Mu</span>
        <span className="font-normal text-fg-muted">Hub</span>
      </span>
    </a>
  );
}

/** Full-width app bar: brand left, global search centered, app-level controls right. */
export function TopBar() {
  return (
    // Side columns match the sidebar width on desktop so the search stays centered over the whole window.
    <header className="sticky top-0 z-30 grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur-md md:grid-cols-[14rem_minmax(0,1fr)_14rem] md:px-4">
      <Brand />
      <div className="mx-auto w-full max-w-xl">
        <SearchField />
      </div>
      <div className="flex justify-end">
        <LocaleSwitch />
      </div>
    </header>
  );
}
