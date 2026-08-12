import { create } from "zustand";
import type { LocalCartItem } from "./localCart.store";

type BuyNowState = {
  item: LocalCartItem | null;
  setItem: (item: LocalCartItem) => void;
  clear: () => void;
};

/**
 * Ephemeral, non-persisted hand-off for the "Buy Now" flow: holds exactly
 * one item so /checkout?mode=buy-now can run its normal single-item flow
 * against just this purchase, entirely independent of the shared
 * multi-item cart (stores/localCart.store.ts) — placing a buy-now order
 * never touches or clears the real cart, and vice versa. Not persisted to
 * localStorage on purpose: it only needs to survive the single in-app
 * navigation from a product card/quick-view to /checkout, not a refresh.
 */
export const useBuyNowStore = create<BuyNowState>()((set) => ({
  item: null,
  setItem: (item) => set({ item }),
  clear: () => set({ item: null }),
}));
