import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { CartContents } from "../components/CartContents";

/**
 * Fashion — full cart page.
 * Shares CartContents with CartDrawer (see layouts/StorefrontLayout.tsx,
 * components/CartDrawer.tsx) so the header/item list/shipping progress/
 * summary only exist in one place — CartContents renders its own "Your bag
 * N" header (no onClose passed here, so it just omits the close button),
 * so this page doesn't render a second, separate heading. Backed by
 * useLocalCartStore, a client-only stand-in until /v2/cart exists — see
 * that store's doc comment.
 */
export function FashionCartPage() {
  return (
    <FashionStorefrontLayout>
      <div className="mx-auto flex max-w-2xl flex-col px-6 py-12">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-current/10">
          <CartContents />
        </div>
      </div>
    </FashionStorefrontLayout>
  );
}
