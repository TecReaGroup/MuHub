import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve } from 'node:path';
import { staticContentTypes } from '../config/constants.mjs';
import { paths } from '../config/paths.mjs';
import { matchesEtag } from '../shared/http.mjs';

/** Serves a built frontend file; resolves false when `pathname` maps to no file inside dist. */
export async function streamFrontend(request, response, pathname) {
  const requestedPath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1));
  const filePath = resolve(paths.distRoot, requestedPath);
  const relativePath = relative(paths.distRoot, filePath);
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) return false;

  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) return false;
    // Vite fingerprints /assets/ file names, so they never change; everything else (index.html) must revalidate.
    const cacheHeaders = {
      'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
      ETag: `W/"${fileStats.size.toString(36)}-${Math.trunc(fileStats.mtimeMs).toString(36)}"`,
      'Last-Modified': fileStats.mtime.toUTCString(),
    };
    if (matchesEtag(request, cacheHeaders.ETag)) {
      response.writeHead(304, cacheHeaders);
      response.end();
      return true;
    }
    response.writeHead(200, {
      ...cacheHeaders,
      'Content-Type': staticContentTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': fileStats.size,
    });
    createReadStream(filePath).pipe(response);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}
