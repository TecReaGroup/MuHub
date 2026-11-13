import { createCollectionClient } from '../../shared/lib/collection-client';

export interface Site {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string;
  createdAt: string;
}

export type SiteDraft = Pick<Site, 'title' | 'url' | 'category' | 'description'>;

export const EMPTY_SITE_DRAFT: SiteDraft = { title: '', url: '', category: '', description: '' };

export const siteClient = createCollectionClient<Site, SiteDraft>('/api/site');

export function toSiteDraft({ title, url, category, description }: Site): SiteDraft {
  return { title, url, category, description };
}

export function siteHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function siteMonogram(title: string): string {
  return Array.from(title.trim()).slice(0, 2).join('').toUpperCase();
}

export function siteMatchesQuery(site: Site, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [site.title, site.url, site.category, site.description]
    .some(text => text.toLowerCase().includes(needle));
}
