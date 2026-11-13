import { fileURLToPath } from 'node:url';

export const paths = {
  distRoot: fileURLToPath(new URL('../../../dist/', import.meta.url)),
  logRoot: fileURLToPath(new URL('../../data/log/', import.meta.url)),
  siteFile: fileURLToPath(new URL('../../data/store/site.json', import.meta.url)),
  diagramFile: fileURLToPath(new URL('../../data/store/diagram.json', import.meta.url)),
};
