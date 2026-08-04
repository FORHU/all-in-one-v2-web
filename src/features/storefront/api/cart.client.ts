import type { Cart } from "../contracts/cart.contract";

/**
 * Storefront — Cart API client.
 * TODO: implement requests against /v2/cart, scoped by the active tenant
 * (x-tenant-slug header, see shared/tenant).
 */

export const getCart = async (): Promise<Cart> => {
  throw new Error("Not implemented: getCart");
};

export const addCartItem = async (
  productVariantId: string,
  quantity: number,
): Promise<Cart> => {
  throw new Error(
    `Not implemented: addCartItem(${productVariantId}, ${quantity})`,
  );
};

export const removeCartItem = async (
  productVariantId: string,
): Promise<Cart> => {
  throw new Error(`Not implemented: removeCartItem(${productVariantId})`);
};
