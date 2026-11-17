import { useAddTrigger } from '../../features/add-action/add-action-context';
import { useI18n } from '../../shared/i18n/locale';
import { RouteLink } from '../../shared/router/RouteLink';
import { Icon, type IconName } from '../../shared/ui/Icon';
import type { NavRoute } from '../../shared/ui/nav-route';

interface TabBarProps {
  routes: readonly NavRoute[];
  activeRouteId: string;
}

const TAB_ITEM_CLASS = 'group flex min-h-12 flex-1 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-control px-2 py-1 text-fg-muted transition-colors select-none active:bg-hover aria-[current=page]:text-accent';

/** Icon over label; route tabs and the add action share it so they always look alike. */
function TabItemContent({ icon, label }: { icon: IconName; label: string }) {
  return (
    <>
      <span className="flex h-7 w-12 items-center justify-center rounded-full transition-colors group-aria-[current=page]:bg-accent-soft">
        <Icon name={icon} className="size-5 shrink-0" />
      </span>
      <span className="text-caption leading-none font-medium">{label}</span>
    </>
  );
}

/** Mobile bottom navigation bar: mirrors the desktop sidebar routes plus the page add action. */
export function TabBar({ routes, activeRouteId }: TabBarProps) {
  const { text } = useI18n();
  const triggerAdd = useAddTrigger();

  return (
    <aside className="order-last shrink-0 border-t border-line bg-canvas px-3 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden">
      <nav aria-label={text['nav.main']} className="flex items-center gap-1">
        {routes.map(route => (
          <RouteLink
            key={route.id}
            href={route.path}
            aria-current={route.id === activeRouteId ? 'page' : undefined}
            className={TAB_ITEM_CLASS}
          >
            <TabItemContent icon={route.icon} label={text[route.labelKey]} />
          </RouteLink>
        ))}
        <button type="button" onClick={triggerAdd} className={TAB_ITEM_CLASS}>
          <TabItemContent icon="squarePlus" label={text['common.add']} />
        </button>
      </nav>
    </aside>
  );
}
