import { assertJsonObject, readRequiredText, readText, readWebOrRootPath } from '../../shared/draft-field.mjs';

const TITLE_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 1000;

/** Parses an untrusted request body into a diagram draft, or throws HttpError(400). */
export function parseDiagramDraft(body) {
  assertJsonObject(body);
  return {
    title: readRequiredText(body, 'title', TITLE_MAX_LENGTH),
    imageUrl: readWebOrRootPath(body, 'imageUrl'),
    description: readText(body, 'description', DESCRIPTION_MAX_LENGTH),
  };
}
