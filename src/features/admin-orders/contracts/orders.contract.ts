import { z } from "zod";

/**
 * FAOS v5 — Admin Orders Contracts
 * Authoritative shape for admin-orders API responses.
 * TODO: align with all-in-one-v2-api's Order/OrderItem/SupplierOrder models.
 */

export const AdminOrderSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "PARTIALLY_FULFILLED",
    "FULFILLED",
    "CANCELLED",
    "REFUNDED",
  ]),
  totalAmount: z.number(),
});

export const AdminOrdersResponseSchema = z.array(AdminOrderSchema);

export type AdminOrder = z.infer<typeof AdminOrderSchema>;
export type AdminOrdersResponse = z.infer<typeof AdminOrdersResponseSchema>;
