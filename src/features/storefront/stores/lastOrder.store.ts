import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export interface LastOrder {
  orderNumber: string;
  placedAt: string;
  items: LastOrderItem[];
  shippingAddress: LastOrderShippingAddress;
  shippingMethodKey: "standard" | "express";
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
 * /order-success (and a refresh of the confirmation page). There is no
 * real orders backend — /v2/orders is unimplemented — so this is not a
 * durable order history, just a hand-off between those two pages. See
 * pages/CheckoutPage.tsx (writes it) and pages/OrderSuccessPage.tsx
 * (reads it).
 */
export const useLastOrderStore = create<LastOrderState>()(
  persist(
    (set) => ({
      order: null,
      setOrder: (order) => set({ order }),
      clearOrder: () => set({ order: null }),
    }),
    { name: "fashion-last-order" },
  ),
);
