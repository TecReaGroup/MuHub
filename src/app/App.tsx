import '../styles.css';
import { AddActionProvider } from '../features/add-action/add-action-context';
import { SearchProvider } from '../features/search/search-context';
import { LocaleProvider } from '../shared/i18n/locale';
import { ToastProvider } from '../shared/ui/Toast';
import { useScrollbar } from '../shared/ui/use-scrollbar';
import { Sidebar } from '../widgets/sidebar/Sidebar';
import { TabBar } from '../widgets/tab-bar/TabBar';
import { TopBar } from '../widgets/top-bar/TopBar';
import { HUB_ROUTES, useHubRoute } from './hub-route';

/** Browse shell: full-width top bar, then the sidebar rail (or mobile tab bar) and the page content on one canvas. */
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
            {/* Only <main> scrolls, so the bars stay put without sticky positioning. */}
            <div className="flex h-dvh flex-col overflow-hidden bg-canvas text-fg">
              <TopBar />
              <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                <Sidebar routes={HUB_ROUTES} activeRouteId={activeRoute.id} />
                <TabBar routes={HUB_ROUTES} activeRouteId={activeRoute.id} />
                <main
                  {...scrollbar}
                  className="scrollbar-subtle min-h-0 min-w-0 flex-1 overflow-y-auto animate-fade-in px-4 pb-8 sm:px-6 md:pr-8 md:pb-16"
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
