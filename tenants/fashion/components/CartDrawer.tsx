"use client";

import { useCartUIStore } from "@/features/storefront/stores/cart.store";
import { CartContents } from "./CartContents";
import { FASHION_DARK_COLORS } from "../theme";

/**
 * Fashion — slide-over cart drawer shell (overlay + positioning only). All
 * header/item-list/footer markup lives in CartContents so the drawer and
 * the full cart page (pages/CartPage.tsx) render identically — see that
 * file's doc comment.
 */
export function CartDrawer() {
  const isOpen = useCartUIStore((s) => s.isDrawerOpen);
  const toggleDrawer = useCartUIStore((s) => s.toggleDrawer);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={toggleDrawer}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label="Shopping cart"
        className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col"
        style={{
          backgroundColor: FASHION_DARK_COLORS.ink,
          color: FASHION_DARK_COLORS.bone,
          borderLeft: `1px solid ${FASHION_DARK_COLORS.hairline}`,
        }}
      >
        <CartContents onNavigate={toggleDrawer} onClose={toggleDrawer} />
      </div>
    </div>
  );
}
