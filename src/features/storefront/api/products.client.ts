import { fetcher } from "@/shared/lib/http";
import { ApiError } from "@/shared/errors/api-error";
import {
  ProductDetailApiEnvelopeSchema,
  ProductsListApiEnvelopeSchema,
  type ProductDetail,
  type ProductsListResponse,
} from "../contracts/products.contract";

export interface ProductListingParams {
  categorySlug?: string;
  brands?: string[];
  colors?: string[];
  sizes?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "popularity";
  page?: number;
  limit?: number;
}

function buildQueryString(params: ProductListingParams): string {
  const search = new URLSearchParams();

  if (params.categorySlug) search.set("categorySlug", params.categorySlug);
  if (params.brands?.length) search.set("brand", params.brands.join(","));
  if (params.colors?.length) search.set("color", params.colors.join(","));
  if (params.sizes?.length) search.set("size", params.sizes.join(","));
  if (params.priceMin != null) search.set("priceMin", String(params.priceMin));
  if (params.priceMax != null) search.set("priceMax", String(params.priceMax));
  if (params.sort) search.set("sort", params.sort);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Storefront — Products API client.
 * Tenant-scoped via the `x-tenant-slug` header — no shared client-side tenant
 * module exists yet, so the caller resolves and passes it explicitly (see
 * CategoryDetailPage, which threads it down from the server-resolved header).
 */
export const getProducts = async (
  tenantSlug: string,
  params: ProductListingParams = {},
): Promise<ProductsListResponse> => {
  const raw = await fetcher<unknown>(
    `/api/v2/products${buildQueryString(params)}`,
    {
      headers: { "x-tenant-slug": tenantSlug },
    },
  );
  return ProductsListApiEnvelopeSchema.parse(raw).data;
};

export const getProductBySlug = async (
  tenantSlug: string,
  slug: string,
): Promise<ProductDetail | null> => {
  try {
    const raw = await fetcher<unknown>(`/api/v2/products/${slug}`, {
      headers: { "x-tenant-slug": tenantSlug },
    });
    return ProductDetailApiEnvelopeSchema.parse(raw).data;
  } catch (err) {
    // A 404 (product not found) is an expected outcome here, not a fetch
    // failure — the page renders its own "not found" state instead of
    // erroring — so it resolves to null rather than throwing.
    if (err instanceof ApiError && err.category === "NOT_FOUND") return null;
    throw err;
  }
};
