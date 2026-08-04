/**
 * Storefront — pricing/display logic shared across all 5 tenants.
 * TODO: mirror all-in-one-v2-api's pricing.util.ts markup calculation for
 * any client-side display needs (the source of truth stays server-side).
 */

export const calculateDisplayPrice = (basePrice: number): number => {
  throw new Error(`Not implemented: calculateDisplayPrice(${basePrice})`);
};
