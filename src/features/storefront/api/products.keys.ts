import type { ProductListingParams } from "./products.client";

export const productsKeys = {
  all: ["storefront", "products"] as const,
  list: (tenantSlug: string, params: ProductListingParams) =>
    [...productsKeys.all, "list", tenantSlug, params] as const,
  detail: (slug: string) => [...productsKeys.all, "detail", slug] as const,
} as const;
