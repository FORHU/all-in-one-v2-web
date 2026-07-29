/**
 * Storefront — shared domain types.
 * TODO: align these shapes with all-in-one-v2-api's Prisma models
 * (Product, ProductVariant, Category, Cart, CartItem).
 */

export interface Product {
  id: string;
  slug: string;
  title: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  title: string;
  price: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface CartItem {
  productVariantId: string;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface CheckoutSession {
  id: string;
  cartId: string;
}
