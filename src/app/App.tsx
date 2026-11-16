import '../styles.css';
import { AddActionProvider } from '../features/add-action/add-action-context';
import { SearchProvider } from '../features/search/search-context';
import { LocaleProvider } from '../shared/i18n/locale';
import { ToastProvider } from '../shared/ui/Toast';
import { useScrollbar } from '../shared/ui/use-scrollbar';
import { Sidebar } from '../widgets/sidebar/Sidebar';
import { TopBar } from '../widgets/top-bar/TopBar';
import { HUB_ROUTES, useHubRoute } from './hub-route';

/** Browse shell: full-width top bar, then the sidebar rail and the page content side by side on one canvas. */
export function App() {
  const activeRoute = useHubRoute();
  const { Page } = activeRoute;
  const scrollbar = useScrollbar();

  return (
    <LocaleProvider>
      <ToastProvider>
        {/* Keyed by route so every page starts with an empty search and no stale add handler. */}
        <SearchProvider key={activeRoute.id}>
          <AddActionProvider>
          <div className="grid h-dvh grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-canvas text-fg">
            <TopBar />
            <div className="flex min-h-0 flex-col md:flex-row">
              <Sidebar routes={HUB_ROUTES} activeRouteId={activeRoute.id} />
              <main
                {...scrollbar}
                className="scrollbar-subtle min-h-0 min-w-0 flex-1 overflow-y-auto animate-fade-in px-4 pb-16 sm:px-6 md:pr-8 md:pl-6"
              >
                <div className="mx-auto w-full max-w-7xl lg:px-8 xl:px-12">
                  <Page />
                </div>
              </main>
            </div>
          </div>
          </AddActionProvider>
        </SearchProvider>
      </ToastProvider>
    </LocaleProvider>
  );
}
