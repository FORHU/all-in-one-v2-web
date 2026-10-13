import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tenantScopedStorage } from "@/shared/lib/tenantScopedStorage";

export interface LastOrderItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageLabel: string;
  imageUrl?: string | null;
  size?: string;
  color?: string;
  quantity: number;
}

export interface LastOrderShippingAddress {
  firstName: string;
  lastName: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface LastOrderShippingMethod {
  logisticName: string;
  price: number;
  /** CJ's own delivery-time string (e.g. "7-15 Working Days") when this came from a live quote; absent for the flat fallback rate. */
  aging?: string;
}

export interface LastOrder {
  orderNumber: string;
  placedAt: string;
  items: LastOrderItem[];
  shippingAddress: LastOrderShippingAddress;
  shippingMethod: LastOrderShippingMethod;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

type LastOrderState = {
  order: LastOrder | null;
  setOrder: (order: LastOrder) => void;
  clearOrder: () => void;
};

/**
 * Snapshot of the most recently "placed" order, persisted to localStorage
 * purely so it survives the client-side navigation from /checkout to
 * /order-success (and a refresh of the confirmation page) — not a durable
 * order history (see hooks/queries/useMyOrders.ts for that), just a
 * hand-off between CheckoutPage.tsx (writes it) and OrderSuccessPage.tsx
 * (reads it), per tenant.
 * Namespaced via tenantScopedStorage (same pattern as localCart.store.ts)
 * so a fashion checkout and a beauty checkout never share one snapshot —
 * `name: "last-order"` resolves to the same literal "fashion-last-order"
 * key fashion already used, so this is a no-op for fashion's existing data.
 */
export const useLastOrderStore = create<LastOrderState>()(
  persist(
    (set) => ({
      order: null,
      setOrder: (order) => set({ order }),
      clearOrder: () => set({ order: null }),
    }),
    { name: "last-order", storage: tenantScopedStorage() },
  ),
);
