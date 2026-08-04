import type { Category } from "../contracts/categories.contract";

/**
 * Storefront — Categories API client.
 * TODO: implement requests against /v2/categories, scoped by the active
 * tenant (x-tenant-slug header, see shared/tenant).
 */

export const getCategories = async (): Promise<Category[]> => {
  throw new Error("Not implemented: getCategories");
};
