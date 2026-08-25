import type { Address } from "@/features/storefront/contracts/address.contract";

/**
 * "Complete" here means checkout-ready — CJ Dropshipping requires all of
 * these to place a supplier order. Mirrors the backend's
 * shipping-completeness.util.ts.
 */
export const REQUIRED_SHIPPING_FIELDS = [
  "country",
  "state",
  "city",
  "addressLine1",
  "fullName",
  "postalCode",
  "phone",
] as const satisfies readonly (keyof Address)[];

export function isShippingAddressComplete(
  address: Address | null | undefined,
): boolean {
  if (!address) return false;
  return REQUIRED_SHIPPING_FIELDS.every((field) => !!address[field]?.trim());
}

export function missingShippingFields(
  address: Address | null | undefined,
): string[] {
  if (!address) return [...REQUIRED_SHIPPING_FIELDS];
  return REQUIRED_SHIPPING_FIELDS.filter((field) => !address[field]?.trim());
}
