import { environment } from '../../config/environment.mjs';
import { paths } from '../../config/paths.mjs';
import { createCollectionRoute } from '../../http/collection-route.mjs';
import { createJsonCollectionStore } from '../../infrastructure/json-collection-store.mjs';
import { parseSiteDraft } from './site-draft.mjs';
import { SEED_SITE_DRAFTS } from './site-seed.mjs';

export const routeSiteRequest = createCollectionRoute({
  basePath: '/api/site',
  store: createJsonCollectionStore({ filePath: paths.siteFile, seedDrafts: environment.isProduction ? [] : SEED_SITE_DRAFTS, moduleName: 'Site' }),
  parseDraft: parseSiteDraft,
  moduleName: 'Site',
});
