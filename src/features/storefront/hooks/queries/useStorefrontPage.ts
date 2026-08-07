import { useSafeQuery } from "@/shared/query/useSafeQuery";
import {
  getStorefrontPage,
  storefrontPageKeys,
} from "@/features/storefront/api";

/**
 * Fetches a fully hydrated storefront page by slug. Multiple components on
 * the same page (e.g. FeaturedProducts + BestSellers, both reading the
 * "home" page's different sections) share one request — React Query
 * dedupes/caches by queryKey automatically, no prop drilling needed.
 */
export function useStorefrontPage(slug: string) {
  return useSafeQuery({
    queryKey: storefrontPageKeys.detail(slug),
    queryFn: () => getStorefrontPage(slug),
  });
}
