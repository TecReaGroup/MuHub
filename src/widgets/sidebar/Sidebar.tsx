import { AddButton } from '../../features/add-action/AddButton';
import { useI18n } from '../../shared/i18n/locale';
import { RouteLink } from '../../shared/router/RouteLink';
import { Icon } from '../../shared/ui/Icon';
import type { NavRoute } from '../../shared/ui/nav-route';

interface SidebarProps {
  routes: readonly NavRoute[];
  activeRouteId: string;
}

// Selected state is driven by aria-current so semantics and visuals never drift apart.
const DESKTOP_NAV_ITEM_CLASS = 'flex h-10 shrink-0 items-center gap-3 rounded-control px-3.5 text-sm whitespace-nowrap text-fg transition-colors pointer-coarse:min-h-11 [&:not([aria-current])]:hover:bg-hover aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-on-accent';

/** Desktop sidebar rail; hidden below `md` where `TabBar` takes over. */
export function Sidebar({ routes, activeRouteId }: SidebarProps) {
  const { text } = useI18n();
  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-2 px-3 py-6 md:flex">
      {/* Bottom padding lifts the centered items toward the optical center. */}
      <nav aria-label={text['nav.main']} className="flex flex-1 flex-col justify-center gap-1 pt-1 pb-32">
        {routes.map(route => (
          <RouteLink key={route.id} href={route.path} aria-current={route.id === activeRouteId ? 'page' : undefined} className={DESKTOP_NAV_ITEM_CLASS}>
            <Icon name={route.icon} className="size-[1.125rem] shrink-0" />
            <span>{text[route.labelKey]}</span>
          </RouteLink>
        ))}
      </nav>
      <AddButton className="w-full" />
    </aside>
  );
}
