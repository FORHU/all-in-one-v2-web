import { fetcher } from "@/shared/lib/http";
import {
  CollectionsApiEnvelopeSchema,
  type CollectionsResponse,
} from "../contracts/collections.contract";

/**
 * Storefront — Collections API client ("Shop the Look" outfits/lookbooks).
 * Tenant-scoped via the `x-tenant-slug` header, same convention as
 * products.client.ts. `categorySlug` narrows to looks featured under that
 * category page (e.g. Women only shows looks tagged womens-fashion) —
 * omitted fetches every look regardless of category.
 */
export const getCollections = async (
  tenantSlug: string,
  type?: string,
  categorySlug?: string,
): Promise<CollectionsResponse> => {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (categorySlug) params.set("categorySlug", categorySlug);
  const qs = params.toString();

  const raw = await fetcher<unknown>(
    `/api/v2/collections${qs ? `?${qs}` : ""}`,
    {
      headers: { "x-tenant-slug": tenantSlug },
    },
  );
  const parsed = CollectionsApiEnvelopeSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data.data.items;
  }

  // Defensive fallback if backend returns raw array or custom page shape
  const rawData = (raw as { data?: unknown })?.data;
  if (Array.isArray(rawData)) return rawData as CollectionsResponse;
  if (
    rawData &&
    typeof rawData === "object" &&
    "items" in rawData &&
    Array.isArray(rawData.items)
  ) {
    return rawData.items as CollectionsResponse;
  }

  return [];
};
