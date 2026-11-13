import { ThemeToggle } from '../../features/theme-toggle/ThemeToggle';
import { Icon, type IconName } from '../../shared/ui/Icon';

export interface SidebarRoute {
  id: string;
  label: string;
  icon: IconName;
}

interface SidebarProps {
  routes: readonly SidebarRoute[];
  activeRouteId: string;
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="size-2 rounded-full bg-accent" />
      <span className="text-sm font-medium tracking-[0.2em] text-fg uppercase">MuHub.</span>
    </div>
  );
}

/** Desktop: full-height left rail with the nav centered. Mobile: a sticky top bar. */
export function Sidebar({ routes, activeRouteId }: SidebarProps) {
  return (
    <aside className="sticky top-0 z-40 flex w-full shrink-0 items-center justify-between gap-3 border-b border-line bg-chrome px-6 py-4 backdrop-blur-xl md:h-screen md:w-56 md:flex-col md:items-stretch md:border-r md:border-b-0 md:py-10">
      <Brand />

      <nav aria-label="主导航" className="flex gap-1.5 rounded-2xl border border-line bg-surface-muted p-1.5 md:my-auto md:flex-col">
        {routes.map(route => {
          const isActive = route.id === activeRouteId;
          return (
            <a
              key={route.id}
              href={`#${route.id}`}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition duration-200 md:px-4 md:py-2.5 ${
                isActive ? 'bg-surface-raised text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
              }`}
            >
              <Icon name={route.icon} className="hidden size-4 opacity-80 sm:block" />
              <span>{route.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="flex items-center justify-between text-xs text-fg-subtle md:pt-4">
        <span className="hidden md:inline">Personal Hub</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
