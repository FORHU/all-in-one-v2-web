/**
 * Cycles through `items` until `minCount` entries are returned. Used where
 * a storefront section's backend strategy currently resolves fewer real
 * products than the layout wants to show (e.g. BEST_SELLERS only resolving
 * 1 product today — see BestSellers.tsx) — reuses real products rather
 * than fabricating placeholder ones, until the backend strategy returns
 * enough on its own. No-op once `items.length >= minCount`.
 */
export function repeatToFill<T>(items: T[], minCount: number): T[] {
  if (items.length === 0 || items.length >= minCount) return items;

  const filled: T[] = [];
  for (let i = 0; i < minCount; i++) {
    filled.push(items[i % items.length]);
  }
  return filled;
}
