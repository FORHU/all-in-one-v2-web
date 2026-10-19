import { fetcher } from "@/shared/lib/http";
import {
  ElectronicsProductsApiEnvelopeSchema,
  type ElectronicsProductsPage,
} from "../contracts/electronics-products.contract";

export type ElectronicsProductSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export interface ElectronicsProductsParams {
  /** DigitFriend category slug; omitted = all categories. */
  category?: string;
  sort?: ElectronicsProductSort;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
}

/**
 * Storefront — DigitFriend (electronics) products.
 * GET /api/v2/electronics/products filters, sorts and paginates on the
 * server; this client just forwards the params. Only the electronics
 * tenant may call it (the API answers 403 for any other store).
 */
export const getElectronicsProducts = async (
  tenantSlug: string,
  params: ElectronicsProductsParams = {},
): Promise<ElectronicsProductsPage> => {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.sort) search.set("sort", params.sort);
  if (params.priceMin != null) search.set("priceMin", String(params.priceMin));
  if (params.priceMax != null) search.set("priceMax", String(params.priceMax));
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();

  const raw = await fetcher<unknown>(
    `/api/v2/electronics/products${qs ? `?${qs}` : ""}`,
    { headers: { "x-tenant-slug": tenantSlug } },
  );
  return ElectronicsProductsApiEnvelopeSchema.parse(raw).data;
};
