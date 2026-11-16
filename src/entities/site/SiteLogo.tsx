import { useState } from 'react';
import { siteMonogram } from './site';

interface SiteLogoProps {
  url: string;
  title: string;
}

/** Uses the site's favicon, falling back to its monogram on load failure. */
export function SiteLogo({ url, title }: SiteLogoProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const faviconUrl = new URL('/favicon.ico', url).href;

  return (
    <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-control bg-surface-sunken text-xs font-semibold text-fg-muted">
      {failedUrl === faviconUrl ? siteMonogram(title) : (
        <img
          key={faviconUrl}
          src={faviconUrl}
          alt=""
          width={24}
          height={24}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-6 object-contain"
          onError={() => setFailedUrl(faviconUrl)}
        />
      )}
    </div>
  );
}
