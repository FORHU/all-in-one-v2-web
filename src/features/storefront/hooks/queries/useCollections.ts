import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getCollections, collectionsKeys } from "@/features/storefront/api";
import type { CollectionType } from "@/features/storefront/contracts/collections.contract";

/**
 * Fetches the tenant-scoped collections list (outfits, lookbooks, bundles,
 * routines, setups), optionally filtered by type.
 */
export function useCollections(type?: CollectionType) {
  return useSafeQuery({
    queryKey: collectionsKeys.list(type),
    queryFn: () => getCollections(type),
  });
}
