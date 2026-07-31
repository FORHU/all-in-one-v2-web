import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageLabel: string;
  colors?: string[];
  sizes?: string[];
}

type WishlistState = {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  isSaved: (productId: string) => boolean;
};

/**
 * Client-only wishlist state, persisted to localStorage.
 * TODO: replace with server-backed state once a real wishlist endpoint
 * exists (there is none yet — see the Prisma schema's Wishlist model,
 * which has no corresponding API route). Same stand-in pattern as
 * localCart.store.ts.
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some(
            (i) => i.productId === item.productId,
          );
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [...state.items, item],
          };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      isSaved: (productId) =>
        get().items.some((i) => i.productId === productId),
    }),
    { name: "fashion-wishlist" },
  ),
);
