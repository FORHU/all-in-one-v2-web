import type { ElectronicsProductsParams } from "./electronics-products.client";

export const electronicsProductsKeys = {
  all: ["storefront", "electronics-products"] as const,
  page: (tenantSlug: string, params: ElectronicsProductsParams) =>
    [...electronicsProductsKeys.all, "page", tenantSlug, params] as const,
} as const;
