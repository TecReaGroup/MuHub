import { useEffect, useState, type ComponentType } from 'react';
import { DiagramPage } from '../pages/diagram/DiagramPage';
import { SitePage } from '../pages/site/SitePage';
import type { NavRoute } from '../shared/ui/nav-route';

export const HUB_ROUTES = [
  { id: 'site', labelKey: 'site.pageTitle', icon: 'link', Page: SitePage },
  { id: 'diagram', labelKey: 'diagram.pageTitle', icon: 'layers', Page: DiagramPage },
] as const satisfies readonly (NavRoute & { Page: ComponentType })[];

type HubRoute = (typeof HUB_ROUTES)[number];

function readRouteFromHash(): HubRoute {
  return HUB_ROUTES.find(route => `#${route.id}` === window.location.hash) ?? HUB_ROUTES[0];
}

/** The active route lives in the URL hash so reloads and back/forward keep it. */
export function useHubRoute(): HubRoute {
  const [activeRoute, setActiveRoute] = useState(readRouteFromHash);

  useEffect(() => {
    const syncFromHash = () => setActiveRoute(readRouteFromHash());
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  return activeRoute;
}
