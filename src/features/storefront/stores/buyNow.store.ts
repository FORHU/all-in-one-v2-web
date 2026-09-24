import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalCartItem } from "./localCart.store";

type BuyNowState = {
  item: LocalCartItem | null;
  setItem: (item: LocalCartItem) => void;
  clear: () => void;
};

/**
 * Hand-off for the "Buy Now" flow: holds exactly one item so
 * /checkout?mode=buy-now can run its normal single-item flow against just
 * this purchase, entirely independent of the shared multi-item cart
 * (stores/localCart.store.ts) — placing a buy-now order never touches or
 * clears the real cart, and vice versa. Persisted (same pattern as
 * localCart.store.ts) so a reload of the checkout page — or hitting the
 * back/forward button — doesn't drop the selection and land on "No item
 * selected"; `clear()` is still called once the order is actually placed,
 * so it doesn't linger past that purchase.
 */
export const useBuyNowStore = create<BuyNowState>()(
  persist(
    (set) => ({
      item: null,
      setItem: (item) => set({ item }),
      clear: () => set({ item: null }),
    }),
    { name: "fashion-buy-now" },
  ),
);
