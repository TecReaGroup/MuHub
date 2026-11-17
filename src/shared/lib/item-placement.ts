/** Where a dragged item landed, by its visible neighbors; null neighbors mean a section edge. */
export interface ItemPlacement {
  itemId: string;
  sectionId: string;
  previousId: string | null;
  nextId: string | null;
}

/**
 * Applies a placement to the full id order. Neighbors come from a possibly filtered view,
 * so the item lands next to them and any hidden items between keep their place.
 */
export function placeId(ids: string[], { itemId, previousId, nextId }: ItemPlacement): string[] {
  const remaining = ids.filter(id => id !== itemId);
  const anchorIndex = nextId ? remaining.indexOf(nextId) : previousId ? remaining.indexOf(previousId) + 1 : -1;
  if (anchorIndex < 0) return ids;
  remaining.splice(anchorIndex, 0, itemId);
  return remaining;
}
