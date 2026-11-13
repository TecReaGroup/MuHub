import { assertJsonObject, readRequiredText, readText, readWebUrl } from '../../shared/draft-field.mjs';

const TITLE_MAX_LENGTH = 60;
const CATEGORY_MAX_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 200;

/** Parses an untrusted request body into a site draft, or throws HttpError(400). */
export function parseSiteDraft(body) {
  assertJsonObject(body);
  return {
    title: readRequiredText(body, 'title', TITLE_MAX_LENGTH),
    url: readWebUrl(body, 'url'),
    category: readRequiredText(body, 'category', CATEGORY_MAX_LENGTH),
    description: readText(body, 'description', DESCRIPTION_MAX_LENGTH),
  };
}
