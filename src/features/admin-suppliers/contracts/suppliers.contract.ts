import { z } from "zod";

/**
 * FAOS v5 — Admin Suppliers Contracts
 * Authoritative shape for admin-suppliers API responses.
 * TODO: align with all-in-one-v2-api's Supplier/SupplierProduct/SupplierSyncLog models.
 */

export const AdminSupplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  isActive: z.boolean(),
});

export const AdminSuppliersResponseSchema = z.array(AdminSupplierSchema);

export type AdminSupplier = z.infer<typeof AdminSupplierSchema>;
export type AdminSuppliersResponse = z.infer<
  typeof AdminSuppliersResponseSchema
>;
