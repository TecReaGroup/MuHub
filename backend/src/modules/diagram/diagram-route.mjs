import { environment } from '../../config/environment.mjs';
import { paths } from '../../config/paths.mjs';
import { createCollectionRoute } from '../../http/collection-route.mjs';
import { createJsonCollectionStore } from '../../infrastructure/json-collection-store.mjs';
import { parseDiagramDraft } from './diagram-draft.mjs';
import { SEED_DIAGRAM_DRAFTS } from './diagram-seed.mjs';

export const routeDiagramRequest = createCollectionRoute({
  basePath: '/api/diagram',
  store: createJsonCollectionStore({ filePath: paths.diagramFile, seedDrafts: environment.isProduction ? [] : SEED_DIAGRAM_DRAFTS, moduleName: 'Diagram' }),
  parseDraft: parseDiagramDraft,
  moduleName: 'Diagram',
});
