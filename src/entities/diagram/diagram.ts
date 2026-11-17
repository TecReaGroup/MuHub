import { API_ENDPOINT } from '../../shared/api/api-endpoint';
import { createCollectionStore, prependItem } from '../../shared/api/collection-store';

export interface Diagram {
  id: string;
  title: string;
  /** http(s) URL or same-origin path, e.g. `/diagram/a.svg`. */
  imageUrl: string;
  description: string;
  createdAt: string;
}

export type DiagramDraft = Pick<Diagram, 'title' | 'imageUrl' | 'description'>;

export const EMPTY_DIAGRAM_DRAFT: DiagramDraft = { title: '', imageUrl: '', description: '' };

export const diagramCollection = createCollectionStore<Diagram, DiagramDraft>(API_ENDPOINT.diagram, 'Diagram', prependItem);

/** Browser-facing src: same-origin paths load directly, anything else goes through the backend proxy. */
export function diagramImageSrc(imageUrl: string): string {
  // "//host" is protocol-relative, i.e. another origin, so only a single leading slash is same-origin.
  const isSameOriginPath = imageUrl.startsWith('/') && !imageUrl.startsWith('//');
  return isSameOriginPath ? imageUrl : `${API_ENDPOINT.diagramImage}?url=${encodeURIComponent(imageUrl)}`;
}

export function toDiagramDraft({ title, imageUrl, description }: Diagram): DiagramDraft {
  return { title, imageUrl, description };
}

export function diagramMatchesQuery(diagram: Diagram, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [diagram.title, diagram.description].some(text => text.toLowerCase().includes(needle));
}
