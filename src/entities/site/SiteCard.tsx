import { Card, CARD_SHELL_CLASS } from '../../shared/ui/Card';
import { Icon } from '../../shared/ui/Icon';
import { ItemActions } from '../../shared/ui/ItemActions';
import { SkeletonBar } from '../../shared/ui/Placeholder';
import { TEXT_ROLE } from '../../shared/ui/text-class';
import { siteHostname, type Site } from './site';
import { SiteLogo } from './SiteLogo';

// Shared by the card and its skeleton so the swap never shifts layout.
const SITE_CARD_LAYOUT_CLASS = 'flex flex-col p-4 sm:p-5';

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onRemove: (site: Site) => void;
}

export function SiteCard({ site, onEdit, onRemove }: SiteCardProps) {
  return (
    <Card className={SITE_CARD_LAYOUT_CLASS}>
      <div className="flex items-start gap-3">
        <SiteLogo url={site.url} title={site.title} />
        <div className="min-w-0 flex-1">
          <h3 className={TEXT_ROLE.cardTitle}>
            {/* Stretched link: the ::after overlay makes the whole card clickable and carries the focus ring. */}
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
            >
              {site.title}
            </a>
          </h3>
          <span className={`mt-0.5 block truncate ${TEXT_ROLE.meta}`}>{siteHostname(site.url)}</span>
        </div>
        <Icon
          name="arrowUpRight"
          className="pointer-events-none mt-0.5 size-4 shrink-0 text-fg-subtle transition-[color,translate] duration-medium group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
        />
      </div>

      <p className={`mt-3 min-h-10 flex-1 ${TEXT_ROLE.cardDescription}`}>{site.description}</p>

      {/* Sits above the stretched link; only the action buttons take pointer events. */}
      <footer className="pointer-events-none relative z-10 mt-3 flex min-h-7 items-center justify-between gap-2">
        <span className="max-w-full truncate rounded-tight bg-surface-sunken px-2 py-0.5 text-caption font-medium text-fg-muted">
          {site.category}
        </span>
        <ItemActions
          itemTitle={site.title}
          onEdit={() => onEdit(site)}
          onRemove={() => onRemove(site)}
          className="pointer-events-auto -mr-1.5"
        />
      </footer>
    </Card>
  );
}

/** Same shell, padding and row heights as `SiteCard`, so the swap causes no layout shift. */
export function SiteCardSkeleton() {
  return (
    <div className={`${CARD_SHELL_CLASS} ${SITE_CARD_LAYOUT_CLASS}`}>
      <div className="flex items-start gap-3">
        <SkeletonBar className="size-10 rounded-control" />
        <div className="flex-1 space-y-2 pt-0.5">
          <SkeletonBar className="h-4 w-2/5" />
          <SkeletonBar className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-3 min-h-10 space-y-2 pt-1">
        <SkeletonBar className="h-3 w-full" />
        <SkeletonBar className="h-3 w-3/4" />
      </div>
      <div className="mt-3 flex h-7 items-center pointer-coarse:h-11">
        <SkeletonBar className="h-4 w-12" />
      </div>
    </div>
  );
}
