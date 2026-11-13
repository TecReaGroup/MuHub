import '../styles.css';
import { ToastProvider } from '../shared/ui/Toast';
import { Sidebar } from '../widgets/sidebar/Sidebar';
import { HUB_ROUTES, useHubRoute } from './hub-route';

export function App() {
  const activeRoute = useHubRoute();
  const { Page } = activeRoute;

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-canvas text-fg md:h-screen md:flex-row">
        <Sidebar routes={HUB_ROUTES} activeRouteId={activeRoute.id} />
        <main className="flex-1 md:overflow-y-auto">
          <div key={activeRoute.id} className="mx-auto max-w-5xl animate-fade-up px-6 py-10 md:px-12 md:py-14">
            <Page />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
