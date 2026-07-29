import type { AdminSuppliersResponse } from "../contracts/suppliers.contract";

/**
 * Admin Suppliers — API client.
 * TODO: implement requests against the supplier sync/import endpoints
 * (/v2/products/import, /v2/product-search, supplier sync logs).
 */

export const getAdminSuppliers = async (): Promise<AdminSuppliersResponse> => {
  throw new Error("Not implemented: getAdminSuppliers");
};
