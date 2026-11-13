import '../styles.css';
import { AddActionProvider } from '../features/add-action/add-action-context';
import { SearchProvider } from '../features/search/search-context';
import { LocaleProvider } from '../shared/i18n/locale';
import { ToastProvider } from '../shared/ui/Toast';
import { Sidebar } from '../widgets/sidebar/Sidebar';
import { TopBar } from '../widgets/top-bar/TopBar';
import { HUB_ROUTES, useHubRoute } from './hub-route';

/** Browse shell: full-width top bar, then the sidebar rail and the page content side by side on one canvas. */
export function App() {
  const activeRoute = useHubRoute();
  const { Page } = activeRoute;

  return (
    <LocaleProvider>
      <ToastProvider>
        {/* Keyed by route so every page starts with an empty search and no stale add handler. */}
        <SearchProvider key={activeRoute.id}>
          <AddActionProvider>
          <div className="min-h-dvh bg-canvas text-fg">
            <TopBar />
            <div className="flex flex-col md:flex-row">
              <Sidebar routes={HUB_ROUTES} activeRouteId={activeRoute.id} />
              <main className="min-w-0 flex-1 animate-fade-in px-4 pb-16 sm:px-6 md:pr-8 md:pl-6">
                <Page />
              </main>
            </div>
          </div>
          </AddActionProvider>
        </SearchProvider>
      </ToastProvider>
    </LocaleProvider>
  );
}
