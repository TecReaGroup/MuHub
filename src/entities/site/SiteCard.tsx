import { IconButton } from '../../shared/ui/Button';
import { Icon } from '../../shared/ui/Icon';
import { siteHostname, siteMonogram, type Site } from './site';

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onRemove: (site: Site) => void;
}

export function SiteCard({ site, onEdit, onRemove }: SiteCardProps) {
  const hostname = siteHostname(site.url);

  return (
    <article className="group relative flex flex-col rounded-2xl border border-zinc-200/70 bg-card p-6 transition-all duration-300 focus-within:border-zinc-400 hover:-translate-y-0.5 hover:border-zinc-400 dark:border-zinc-800/70 dark:focus-within:border-zinc-600 dark:hover:border-zinc-600">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200/50 bg-zinc-100 text-xs font-semibold text-zinc-700 dark:border-zinc-700/50 dark:bg-zinc-800/80 dark:text-zinc-300">
            {siteMonogram(site.title)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {/* The ::after overlay stretches the link over the whole card. */}
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none"
              >
                {site.title}
              </a>
            </h3>
            <span className="mt-0.5 block truncate text-[11px] text-zinc-400">{hostname}</span>
          </div>
        </div>
        <Icon
          name="arrowUpRight"
          className="size-4 shrink-0 text-zinc-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-900 dark:text-zinc-600 dark:group-hover:text-zinc-200"
        />
      </div>

      <p className="mb-5 line-clamp-2 flex-1 text-xs font-light leading-relaxed text-zinc-500 dark:text-zinc-400">
        {site.description}
      </p>

      <footer className="pointer-events-none relative z-10 -mb-1.5 flex items-center justify-between border-t border-zinc-100 pt-1.5 dark:border-zinc-800/60">
        <span className="text-[11px] text-zinc-400">{site.category}</span>
        <div className="pointer-events-auto -mr-2 flex items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
          <IconButton label={`编辑 ${site.title}`} onClick={() => onEdit(site)}>
            <Icon name="pencil" className="size-3.5" />
          </IconButton>
          <IconButton label={`删除 ${site.title}`} onClick={() => onRemove(site)} className="hover:text-red-600! dark:hover:text-red-400!">
            <Icon name="trash" className="size-3.5" />
          </IconButton>
        </div>
      </footer>
    </article>
  );
}
