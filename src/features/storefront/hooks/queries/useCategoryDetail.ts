import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getCategoryBySlug, categoriesKeys } from "@/features/storefront/api";

/**
 * Fetches a single category with its products (up to 20 — see
 * CategoryRepository.findBySlug in the API). Powers category detail /
 * listing pages (e.g. tenants/fashion/pages/CategoryDetailPage.tsx).
 *
 * suppressErrorToast: a 404 here (unknown/stale category slug — e.g. a nav
 * link that hasn't been updated to a real slug yet) is expected and
 * already rendered as an inline "category not found" state by the page —
 * without this, the global QueryCache.onError handler in query-provider.tsx
 * would ALSO fire a redundant toast with the raw backend error message,
 * since routeError() has no specific case for NOT_FOUND and falls through
 * to its generic `toast: error.message` default.
 */
export function useCategoryDetail(slug: string) {
  return useSafeQuery({
    queryKey: categoriesKeys.detail(slug),
    queryFn: () => getCategoryBySlug(slug),
    meta: { suppressErrorToast: true },
  });
}
