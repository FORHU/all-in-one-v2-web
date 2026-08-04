/**
 * Storefront — shared domain types, re-exported from the Zod contracts
 * that remain the single source of truth (see contracts/*.contract.ts).
 */

export type { Product, ProductVariant } from "../contracts/products.contract";
export type { Category } from "../contracts/categories.contract";
export type { CartItem, Cart } from "../contracts/cart.contract";
export type { CheckoutSession } from "../contracts/checkout.contract";
