import { create } from "zustand";

/**
 * Storefront — local UI-only cart state (e.g. drawer open/closed).
 * Server cart state itself stays in React Query (see hooks/useCart.ts) —
 * this store must never duplicate server data.
 */
type CartUIState = {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
};

export const useCartUIStore = create<CartUIState>((set) => ({
  isDrawerOpen: false,
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));
