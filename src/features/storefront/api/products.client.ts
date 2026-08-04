import type { Product } from "../contracts/products.contract";

/**
 * Storefront — Products API client.
 * TODO: implement requests against /v2/products and /v2/product-search,
 * scoped by the active tenant (x-tenant-slug header, see shared/tenant).
 */

export const getProducts = async (): Promise<Product[]> => {
  throw new Error("Not implemented: getProducts");
};

export const getProductBySlug = async (
  slug: string,
): Promise<Product | null> => {
  throw new Error(`Not implemented: getProductBySlug(${slug})`);
};
