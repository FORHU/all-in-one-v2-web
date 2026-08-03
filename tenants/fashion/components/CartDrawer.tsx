"use client";

import { X } from "lucide-react";
import { useCartUIStore } from "@/features/storefront/stores/cart.store";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { CartContents } from "./CartContents";

/**
 * Fashion — slide-over cart drawer, triggered from the header cart icon
 * (see layouts/StorefrontLayout.tsx). Rendered once in
 * FashionStorefrontLayout so it's available from any page.
 */
export function CartDrawer() {
  const isOpen = useCartUIStore((s) => s.isDrawerOpen);
  const toggleDrawer = useCartUIStore((s) => s.toggleDrawer);
  const itemCount = useLocalCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );

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
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col"
        style={{
          backgroundColor: "var(--brand-secondary)",
          color: "var(--brand-primary)",
        }}
      >
        <div className="flex items-center justify-between border-b border-current/10 px-6 py-5">
          <h2 className="text-lg font-bold">Your Cart ({itemCount})</h2>
          <button type="button" onClick={toggleDrawer} aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>
        <CartContents onNavigate={toggleDrawer} />
      </div>
    </div>
  );
}
