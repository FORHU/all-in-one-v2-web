import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FashionColorMode = "dark" | "light";

type ColorModeState = {
  mode: FashionColorMode;
  toggle: () => void;
};

/**
 * Fashion — site-wide light/dark toggle. "dark" (white-on-black) is the
 * tenant's current default; "light" flips --brand-primary/--brand-secondary
 * back to the original black-on-white pairing (see layouts/StorefrontLayout.tsx
 * and pages/LoginPage.tsx, the two root shells that read `mode` to override
 * the CSS variables set in styles/theme.css). Persisted so the choice
 * survives reloads, unlike stores/cart.store.ts's drawer-open state.
 */
export const useFashionColorMode = create<ColorModeState>()(
  persist(
    (set) => ({
      mode: "dark",
      toggle: () =>
        set((state) => ({ mode: state.mode === "dark" ? "light" : "dark" })),
    }),
    { name: "fashion-color-mode" },
  ),
);
