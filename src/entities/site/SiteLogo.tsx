import { useState } from 'react';
import { API_ENDPOINT } from '../../shared/api/api-endpoint';
import { siteMonogram } from './site';

interface SiteLogoProps {
  url: string;
  title: string;
}

/** Shows the site's best declared icon (resolved by the backend), falling back to its monogram. */
export function SiteLogo({ url, title }: SiteLogoProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const iconUrl = `${API_ENDPOINT.siteIcon}?url=${encodeURIComponent(url)}`;

  return (
    <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-control bg-surface-sunken text-xs font-semibold text-fg-muted">
      {failedUrl === iconUrl ? siteMonogram(title) : (
        <img
          key={iconUrl}
          src={iconUrl}
          alt=""
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
          className="size-8 rounded-tight object-contain"
          onError={() => setFailedUrl(iconUrl)}
        />
      )}
    </div>
  );
}
