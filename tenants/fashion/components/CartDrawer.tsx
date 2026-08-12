"use client";

import { useEffect, useState } from "react";
import { useCartUIStore } from "@/features/storefront/stores/cart.store";
import { CartContents } from "./CartContents";
import { useFashionColorMode } from "../stores/colorMode.store";
import { getFashionColors } from "../theme";

/**
 * Fashion — slide-over cart drawer shell (overlay + positioning only). All
 * header/item-list/footer markup lives in CartContents so the drawer and
 * the full cart page (pages/CartPage.tsx) render identically — see that
 * file's doc comment.
 *
 * Follows the site's light/dark toggle, same as CartContents — gated
 * behind a mount flag since useFashionColorMode persists to localStorage,
 * unavailable during SSR (same pattern as layouts/StorefrontLayout.tsx).
 */
export function CartDrawer() {
  const isOpen = useCartUIStore((s) => s.isDrawerOpen);
  const toggleDrawer = useCartUIStore((s) => s.toggleDrawer);
  const colorMode = useFashionColorMode((s) => s.mode);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const mode = hasMounted ? colorMode : "dark";
  const colors = getFashionColors(mode);

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
          backgroundColor: colors.ink,
          color: colors.bone,
          borderLeft: `1px solid ${colors.hairline}`,
        }}
      >
        <CartContents onNavigate={toggleDrawer} onClose={toggleDrawer} />
      </div>
    </div>
  );
}
