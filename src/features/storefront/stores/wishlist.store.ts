import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tenantScopedStorage } from "@/shared/lib/tenantScopedStorage";

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
};

/**
 * Client-only favorites state, persisted to localStorage, namespaced per
 * tenant via tenantScopedStorage (each tenant gets its own
 * "<slug>-wishlist" key — see that helper's doc comment for why). Same
 * pattern as localCart.store.ts — no backend wishlist endpoint exists yet,
 * so this is what heart/favorite toggles (e.g. Shop the Look thumbnails,
 * MirrorShelfHero's "N Saved" count) actually operate on until a real
 * GET/POST /v2/wishlist exists.
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
    { name: "wishlist", storage: tenantScopedStorage() },
  ),
);
