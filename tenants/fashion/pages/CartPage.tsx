import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { CartContents } from "../components/CartContents";

/**
 * Fashion — full cart page.
 * Shares CartContents with CartDrawer (see layouts/StorefrontLayout.tsx,
 * components/CartDrawer.tsx) so the item list / shipping progress /
 * promo / summary logic only exists in one place. Backed by
 * useLocalCartStore, a client-only stand-in until /v2/cart exists — see
 * that store's doc comment.
 */
export function FashionCartPage() {
  return (
    <FashionStorefrontLayout>
      <div
        className="mx-auto flex max-w-2xl flex-col px-6 py-12"
        style={{ color: "var(--brand-primary)" }}
      >
        <h1
          className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Your Cart
        </h1>
        <div className="flex flex-col rounded-2xl border border-current/10">
          <CartContents />
        </div>
      </div>
    </FashionStorefrontLayout>
  );
}
