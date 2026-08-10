import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getCollections, collectionsKeys } from "@/features/storefront/api";

/**
 * Fetches the tenant-scoped collections list ("Shop the Look" outfits/lookbooks).
 * `type` optionally narrows to one CollectionType (e.g. "OUTFIT") — omitted
 * fetches every type, which is what the fashion tenant's OUTFIT + LOOKBOOK
 * rows both need to show up together. `categorySlug` narrows to looks
 * featured under that category page.
 */
export function useCollections(
  tenantSlug: string,
  type?: string,
  categorySlug?: string,
) {
  return useSafeQuery({
    queryKey: collectionsKeys.list(tenantSlug, type, categorySlug),
    queryFn: () => getCollections(tenantSlug, type, categorySlug),
  });
}
