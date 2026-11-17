import { useEffect, type ComponentType } from 'react';
import { DiagramPage } from '../pages/diagram/DiagramPage';
import { SitePage } from '../pages/site/SitePage';
import { redirect, usePathname } from '../shared/router/history';
import type { NavRoute } from '../shared/ui/nav-route';

export const HUB_ROUTES = [
  { id: 'site', path: '/sites', labelKey: 'site.pageTitle', icon: 'link', Page: SitePage },
  { id: 'diagram', path: '/diagrams', labelKey: 'diagram.pageTitle', icon: 'layers', Page: DiagramPage },
] as const satisfies readonly (NavRoute & { Page: ComponentType })[];

type HubRoute = (typeof HUB_ROUTES)[number];

const DEFAULT_ROUTE: HubRoute = HUB_ROUTES[0];

/** Resolves the page from the URL path; `/` and unknown paths are rewritten to the default route. */
export function useHubRoute(): HubRoute {
  const pathname = usePathname();
  const matchedRoute = HUB_ROUTES.find(route => route.path === pathname);

  useEffect(() => {
    if (!matchedRoute) redirect(DEFAULT_ROUTE.path);
  }, [matchedRoute]);

  return matchedRoute ?? DEFAULT_ROUTE;
}
