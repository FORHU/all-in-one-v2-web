import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getCollections, collectionsKeys } from "@/features/storefront/api";

/**
 * Fetches the tenant-scoped collections list ("Shop the Look" outfits/lookbooks).
 * `type` optionally narrows to one CollectionType (e.g. "OUTFIT") — omitted
 * fetches every type, which is what the fashion tenant's OUTFIT + LOOKBOOK
 * rows both need to show up together. `categorySlug` narrows to looks
 * featured under that category page. `limit` defaults to the backend's own
 * default (20) — callers that filter/group the full result set client-side
 * (e.g. GetTheLookMoodboard, ShopBySeason) must pass a limit covering every
 * row, or rows beyond the first page silently never arrive to be filtered.
 */
export function useCollections(
  tenantSlug: string,
  type?: string,
  categorySlug?: string,
  limit?: number,
) {
  return useSafeQuery({
    queryKey: collectionsKeys.list(tenantSlug, type, categorySlug, limit),
    queryFn: () => getCollections(tenantSlug, type, categorySlug, limit),
  });
}
