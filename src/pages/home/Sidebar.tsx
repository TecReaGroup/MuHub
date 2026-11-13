import { ThemeToggle } from '../../features/theme-toggle/ThemeToggle';
import { Icon } from '../../shared/ui/Icon';
import { HUB_VIEWS, type HubViewId } from './hub-view';

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="size-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
      <span className="text-sm font-medium tracking-[0.2em] text-zinc-900 uppercase dark:text-zinc-100">MuHub.</span>
    </div>
  );
}

export function Sidebar({ activeView }: { activeView: HubViewId }) {
  return (
    <aside className="sticky top-0 z-40 flex w-full shrink-0 items-center justify-between gap-3 border-b border-zinc-200/70 bg-white/60 px-6 py-4 backdrop-blur-xl md:h-screen md:w-56 md:flex-col md:items-stretch md:border-r md:border-b-0 md:py-10 dark:border-zinc-800/70 dark:bg-zinc-950/60">
      <Brand />

      <nav
        aria-label="主导航"
        className="flex gap-1.5 rounded-2xl border border-zinc-200/50 bg-zinc-100/80 p-1.5 md:my-auto md:flex-col dark:border-zinc-800/50 dark:bg-zinc-900/80"
      >
        {HUB_VIEWS.map(view => {
          const isActive = view.id === activeView;
          return (
            <a
              key={view.id}
              href={`#${view.id}`}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 md:px-4 md:py-2.5 ${
                isActive
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Icon name={view.icon} className="hidden size-4 opacity-80 sm:block" />
              <span>{view.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="flex items-center justify-between text-xs text-zinc-400 md:pt-4">
        <span className="hidden md:inline">Personal Hub</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
