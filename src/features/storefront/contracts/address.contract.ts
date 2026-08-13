import { z } from "zod";

/**
 * FAOS v5 — Storefront Address Contracts.
 * Authoritative shape for GET /v2/addresses/latest and POST /v2/addresses.
 */

export const AddressSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  fullName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  state: z.string().nullable(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/** null when the customer has never saved an address (first-time checkout). */
export const LatestAddressApiEnvelopeSchema = z.object({
  data: AddressSchema.nullable(),
});

export const SaveAddressApiEnvelopeSchema = z.object({
  data: AddressSchema,
});

export const SaveAddressInputSchema = z.object({
  fullName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
});

export type Address = z.infer<typeof AddressSchema>;
export type SaveAddressInput = z.infer<typeof SaveAddressInputSchema>;
