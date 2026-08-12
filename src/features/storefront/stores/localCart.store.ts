import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocalCartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  imageLabel: string;
  imageUrl?: string | null;
  size?: string;
  color?: string;
  quantity: number;
  /** Available stock for this exact size/color combo at the moment it was added — only known when added from the product detail page (see ProductDetailPage.tsx's real per-variant stock). Undefined for items added elsewhere (quick-add, quick-view), which don't have that number to give. */
  stock?: number;
}

type NewCartItem = Omit<LocalCartItem, "id">;

type LocalCartState = {
  items: LocalCartItem[];
  addItem: (item: NewCartItem) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

export function makeLineId(item: NewCartItem) {
  return `${item.productId}-${item.size ?? "none"}-${item.color ?? "none"}`;
}

/**
 * Client-only cart state, persisted to localStorage.
 * TODO: replace with server-backed state (features/storefront/hooks/useCart)
 * once /v2/cart is implemented — this exists purely so the cart
 * drawer/page/header badge have something real to operate on until then.
 * Deliberately separate from stores/cart.store.ts (drawer open/closed UI
 * state only, per its own docs) and from useCart() (hits the real,
 * currently-unimplemented backend).
 */
export const useLocalCartStore = create<LocalCartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const id = makeLineId(item);
          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id
                  ? {
                      ...i,
                      quantity: i.quantity + item.quantity,
                      stock: item.stock ?? i.stock,
                    }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, id }] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "fashion-local-cart" },
  ),
);
