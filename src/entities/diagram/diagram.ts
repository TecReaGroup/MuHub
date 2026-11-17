import { API_ENDPOINT } from '../../shared/api/api-endpoint';
import { createCollectionStore } from '../../shared/api/collection-store';

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

export const diagramCollection = createCollectionStore<Diagram, DiagramDraft>(API_ENDPOINT.diagram, 'Diagram');

export function toDiagramDraft({ title, imageUrl, description }: Diagram): DiagramDraft {
  return { title, imageUrl, description };
}

export function diagramMatchesQuery(diagram: Diagram, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [diagram.title, diagram.description].some(text => text.toLowerCase().includes(needle));
}
