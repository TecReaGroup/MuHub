import { API_ENDPOINT } from '../../shared/api/api-endpoint';
import { createCollectionStore, prependItem } from '../../shared/api/collection-store';

export interface Diagram {
  id: string;
  title: string;
  /** http(s) URL or same-origin path, e.g. `/diagram/a.svg`. */
  imageUrl: string;
  description: string;
  createdAt: string;
  /** Missing on records never edited. */
  updatedAt?: string;
}

export type DiagramDraft = Pick<Diagram, 'title' | 'imageUrl' | 'description'>;

export const EMPTY_DIAGRAM_DRAFT: DiagramDraft = { title: '', imageUrl: '', description: '' };

export const diagramCollection = createCollectionStore<Diagram, DiagramDraft>(API_ENDPOINT.diagram, 'Diagram', prependItem);

/** Changes whenever the record is saved, so a save also re-fetches an image re-exported at the same URL. */
export function diagramRevision({ createdAt, updatedAt }: Diagram): string {
  return updatedAt ?? createdAt;
}

/**
 * Browser-facing src: same-origin paths load directly, anything else goes through the backend proxy.
 * `revision` is part of the src because browsers reuse an already-loaded image for an identical src
 * within the page, ignoring Cache-Control, so the same share URL would never show a re-export.
 */
export function diagramImageSrc(imageUrl: string, revision: string): string {
  // "//host" is protocol-relative, i.e. another origin, so only a single leading slash is same-origin.
  const isSameOriginPath = imageUrl.startsWith('/') && !imageUrl.startsWith('//');
  const revisionParam = `v=${encodeURIComponent(revision)}`;
  if (!isSameOriginPath) return `${API_ENDPOINT.diagramImage}?url=${encodeURIComponent(imageUrl)}&${revisionParam}`;
  return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}${revisionParam}`;
}

export function toDiagramDraft({ title, imageUrl, description }: Diagram): DiagramDraft {
  return { title, imageUrl, description };
}

export function diagramMatchesQuery(diagram: Diagram, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [diagram.title, diagram.description].some(text => text.toLowerCase().includes(needle));
}
