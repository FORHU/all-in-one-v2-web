import { fetcher } from "@/shared/lib/http";
import {
  LatestAddressApiEnvelopeSchema,
  SaveAddressApiEnvelopeSchema,
  type Address,
  type SaveAddressInput,
} from "../contracts/address.contract";

/**
 * Storefront — Address API client. Tenant-scoped via `x-tenant-slug`, same
 * convention as products.client.ts; auth is via the Bearer token fetcher
 * already attaches automatically (see shared/lib/http.ts) — these endpoints
 * 401 for signed-out callers, matching pages/CheckoutPage.tsx's auth gate.
 */
export const getLatestAddress = async (
  tenantSlug: string,
): Promise<Address | null> => {
  const raw = await fetcher<unknown>("/api/v2/addresses/latest", {
    headers: { "x-tenant-slug": tenantSlug },
  });
  return LatestAddressApiEnvelopeSchema.parse(raw).data;
};

export const saveAddress = async (
  tenantSlug: string,
  input: SaveAddressInput,
): Promise<Address> => {
  const raw = await fetcher<unknown>("/api/v2/addresses", {
    method: "POST",
    headers: { "x-tenant-slug": tenantSlug },
    body: JSON.stringify(input),
  });
  return SaveAddressApiEnvelopeSchema.parse(raw).data;
};
