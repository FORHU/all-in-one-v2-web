import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getPageBySlug } from "../api/cms.client";
import { cmsKeys } from "../api/cms.keys";

/**
 * Fetches a tenant-scoped CMS page (e.g. /about, /contact) by slug.
 */
export function usePage(slug: string) {
  return useSafeQuery({
    queryKey: cmsKeys.bySlug(slug),
    queryFn: () => getPageBySlug(slug),
  });
}
