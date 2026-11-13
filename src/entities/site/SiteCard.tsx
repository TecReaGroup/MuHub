import { Card } from '../../shared/ui/Card';
import { Icon } from '../../shared/ui/Icon';
import { ItemActions } from '../../shared/ui/ItemActions';
import { siteHostname, siteMonogram, type Site } from './site';

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onRemove: (site: Site) => void;
}

export function SiteCard({ site, onEdit, onRemove }: SiteCardProps) {
  const hostname = siteHostname(site.url);

  return (
    <Card className="flex flex-col p-6 hover:-translate-y-0.5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-muted text-xs font-semibold text-fg-muted">
            {siteMonogram(site.title)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-fg">
              {/* Stretched link: the ::after overlay makes the whole card clickable and carries the focus ring. */}
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
              >
                {site.title}
              </a>
            </h3>
            <span className="mt-0.5 block truncate text-[11px] text-fg-subtle">{hostname}</span>
          </div>
        </div>
        <Icon
          name="arrowUpRight"
          className="size-4 shrink-0 text-fg-subtle transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
        />
      </div>

      <p className="mb-5 line-clamp-2 flex-1 text-xs leading-relaxed font-light text-fg-muted">{site.description}</p>

      {/* Sits above the stretched link; only the action buttons take pointer events. */}
      <footer className="pointer-events-none relative z-10 -mb-1.5 flex items-center justify-between border-t border-line pt-1.5">
        <span className="text-[11px] text-fg-subtle">{site.category}</span>
        <ItemActions
          itemTitle={site.title}
          onEdit={() => onEdit(site)}
          onRemove={() => onRemove(site)}
          className="pointer-events-auto -mr-2"
        />
      </footer>
    </Card>
  );
}
