import { DiagramView } from './DiagramView';
import { useHubView } from './hub-view';
import { Sidebar } from './Sidebar';
import { SiteView } from './SiteView';

export function HomePage() {
  const activeView = useHubView();

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-zinc-900 transition-colors duration-300 md:h-screen md:flex-row dark:text-zinc-100">
      <Sidebar activeView={activeView} />
      <main className="flex-1 md:overflow-y-auto">
        <div key={activeView} className="mx-auto max-w-5xl animate-fade-up px-6 py-10 md:px-12 md:py-14">
          {activeView === 'diagram' ? <DiagramView /> : <SiteView />}
        </div>
      </main>
    </div>
  );
}
