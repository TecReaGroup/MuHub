/**
 * Category order is derived from site order, so a new site goes after the last site of its
 * category (or at the end for a new category) to leave the existing category order untouched.
 */
export function insertSiteInCategory(sites, site) {
  const index = sites.findLastIndex(existing => existing.category === site.category);
  return index === -1 ? [...sites, site] : sites.toSpliced(index + 1, 0, site);
}
