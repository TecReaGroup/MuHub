import { AddButton } from '../../features/add-action/AddButton';
import { useI18n } from '../../shared/i18n/locale';
import type { PlainMessageKey } from '../../shared/i18n/message';
import { Icon, type IconName } from '../../shared/ui/Icon';

export interface SidebarRoute {
  id: string;
  labelKey: PlainMessageKey;
  icon: IconName;
}

interface SidebarProps {
  routes: readonly SidebarRoute[];
  activeRouteId: string;
}

// Selected state is driven by aria-current so semantics and visuals never drift apart.
const NAV_ITEM_CLASS = 'flex h-10 items-center gap-3 rounded-control px-3.5 text-sm whitespace-nowrap text-fg transition-colors [&:not([aria-current])]:hover:bg-hover aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-on-accent';

/** Desktop: rail under the top bar with the add button pinned to its bottom. Narrow screens: a horizontal strip. */
export function Sidebar({ routes, activeRouteId }: SidebarProps) {
  const { text } = useI18n();
  return (
    <aside className="flex shrink-0 items-center gap-2 border-b border-line px-4 py-2 md:sticky md:top-14 md:h-[calc(100dvh-3.5rem)] md:w-56 md:flex-col md:items-stretch md:border-b-0 md:px-3 md:py-6">
      <nav aria-label={text['nav.main']} className="flex min-w-0 flex-1 gap-1 md:flex-col">
        {routes.map(route => (
          <a
            key={route.id}
            href={`#${route.id}`}
            aria-current={route.id === activeRouteId ? 'page' : undefined}
            className={NAV_ITEM_CLASS}
          >
            <Icon name={route.icon} className="size-[1.125rem] shrink-0" />
            <span>{text[route.labelKey]}</span>
          </a>
        ))}
      </nav>
      <AddButton className="md:w-full" />
    </aside>
  );
}
