import { fetcher } from "@/shared/lib/http";
import {
  StorefrontPageEnvelopeSchema,
  type StorefrontPage,
} from "../contracts/storefront-page.contract";

/**
 * Storefront — Page API client.
 * Fetches a fully hydrated page (home, category landing, campaign, ...)
 * with every section already resolved into real products by the backend's
 * strategy engine. Requests are scoped to the active tenant via the
 * x-tenant-slug header, attached automatically by shared/lib/http.ts.
 */
export const getStorefrontPage = async (
  slug: string,
): Promise<StorefrontPage> => {
  const raw = await fetcher<unknown>(`/api/v2/storefront?slug=${slug}`);
  return StorefrontPageEnvelopeSchema.parse(raw).data;
};
