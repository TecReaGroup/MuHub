import { API_ENDPOINT } from '../../shared/api/api-endpoint';
import { createCollectionStore } from '../../shared/api/collection-store';

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

export const siteCollection = createCollectionStore<Site, SiteDraft>(API_ENDPOINT.site, 'Site');

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

/** Categories in the order their first site appears; there is no separate category list. */
export function siteCategories(sites: Site[]): string[] {
  return [...new Set(sites.map(site => site.category))];
}

export function siteMatchesQuery(site: Site, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [site.title, site.url, site.category, site.description]
    .some(text => text.toLowerCase().includes(needle));
}
