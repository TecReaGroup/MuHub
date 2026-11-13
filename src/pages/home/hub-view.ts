import { useEffect, useState } from 'react';
import type { IconName } from '../../shared/ui/Icon';

export const HUB_VIEWS = [
  { id: 'site', label: '导航', icon: 'globe' },
  { id: 'diagram', label: '架构图', icon: 'layers' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

export type HubViewId = (typeof HUB_VIEWS)[number]['id'];

function readViewFromHash(): HubViewId {
  return HUB_VIEWS.find(view => `#${view.id}` === window.location.hash)?.id ?? 'site';
}

/** Active view lives in the URL hash so reloads and back/forward keep it. */
export function useHubView(): HubViewId {
  const [activeView, setActiveView] = useState(readViewFromHash);

  useEffect(() => {
    const syncFromHash = () => setActiveView(readViewFromHash());
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  return activeView;
}
