import { useAddTrigger } from '../../features/add-action/add-action-context';
import { useI18n } from '../../shared/i18n/locale';
import { Icon } from '../../shared/ui/Icon';
import type { NavRoute } from '../../shared/ui/nav-route';

interface TabBarProps {
  routes: readonly NavRoute[];
  activeRouteId: string;
}

const TAB_ITEM_CLASS = 'group flex min-h-12 flex-1 shrink-0 flex-col items-center justify-center gap-0.5 rounded-control px-2 py-1 text-fg-muted transition-colors select-none active:bg-hover aria-[current=page]:text-accent';

/** Mobile bottom navigation bar: mirrors the desktop sidebar routes plus the page add action. */
export function TabBar({ routes, activeRouteId }: TabBarProps) {
  const { text } = useI18n();
  const triggerAdd = useAddTrigger();

  return (
    <aside className="order-last shrink-0 border-t border-line bg-canvas/95 px-3 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <nav aria-label={text['nav.main']} className="flex min-w-0 items-center gap-1">
        {routes.map(route => (
          <a
            key={route.id}
            href={`#${route.id}`}
            aria-current={route.id === activeRouteId ? 'page' : undefined}
            className={TAB_ITEM_CLASS}
          >
            <span className="flex h-7 w-12 items-center justify-center rounded-full transition-colors group-aria-[current=page]:bg-accent-soft">
              <Icon name={route.icon} className="size-5 shrink-0" />
            </span>
            <span className="text-caption leading-none font-medium">{text[route.labelKey]}</span>
          </a>
        ))}
        <button
          type="button"
          aria-label={text['common.add']}
          onClick={triggerAdd}
          className={`cursor-pointer ${TAB_ITEM_CLASS}`}
        >
          <span className="flex h-7 w-12 items-center justify-center rounded-full bg-surface-sunken text-fg transition-colors group-active:bg-line">
            <Icon name="plus" className="size-5 shrink-0" />
          </span>
          <span className="text-caption leading-none font-medium">{text['common.add']}</span>
        </button>
      </nav>
    </aside>
  );
}
