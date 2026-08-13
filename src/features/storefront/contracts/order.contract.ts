import { z } from "zod";

/**
 * FAOS v5 — Storefront Order Contracts.
 * Authoritative shape for GET /v2/orders/my-orders and
 * POST /v2/orders/checkout-direct.
 */

export const OrderStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "CANCELLED",
  "REFUNDED",
]);

export const OrderItemSchema = z.object({
  id: z.string(),
  productVariantId: z.string(),
  quantity: z.number(),
  unitPrice: z.coerce.number(),
  productTitle: z.string(),
  variantTitle: z.string().nullable(),
  sku: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  status: OrderStatusSchema,
  subtotal: z.coerce.number(),
  discountAmount: z.coerce.number(),
  taxAmount: z.coerce.number(),
  shippingAmount: z.coerce.number(),
  totalAmount: z.coerce.number(),
  currency: z.string(),
  createdAt: z.coerce.date(),
  items: z.array(OrderItemSchema),
});

export const MyOrdersResponseSchema = z.object({
  items: z.array(OrderSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const MyOrdersApiEnvelopeSchema = z.object({
  data: MyOrdersResponseSchema,
});

export const CheckoutDirectItemInputSchema = z.object({
  productId: z.string(),
  size: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().int().min(1),
});

export const CheckoutDirectInputSchema = z.object({
  items: z.array(CheckoutDirectItemInputSchema).min(1),
  shippingAddressId: z.string().optional(),
  currency: z.string().optional(),
});

export const CheckoutDirectApiEnvelopeSchema = z.object({
  data: OrderSchema,
});

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type MyOrdersResponse = z.infer<typeof MyOrdersResponseSchema>;
export type CheckoutDirectItemInput = z.infer<
  typeof CheckoutDirectItemInputSchema
>;
export type CheckoutDirectInput = z.infer<typeof CheckoutDirectInputSchema>;
