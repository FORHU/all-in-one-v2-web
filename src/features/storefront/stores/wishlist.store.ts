import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
};

/**
 * Client-only favorites state, persisted to localStorage. Same pattern as
 * localCart.store.ts — no backend wishlist endpoint exists yet, so this is
 * what heart/favorite toggles (e.g. Shop the Look thumbnails) actually
 * operate on until a real GET/POST /v2/wishlist exists.
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((existing) => existing !== id)
            : [...state.ids, id],
        })),
    }),
    { name: "fashion-wishlist" },
  ),
);
