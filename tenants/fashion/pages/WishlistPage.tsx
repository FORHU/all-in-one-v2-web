import Link from "next/link";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";

/**
 * Fashion — wishlist page.
 * Initial empty-state shell only — there is no wishlist store/endpoint yet
 * (see ProductCard's favorite toggle, which is local-only for the same
 * reason). Real saved-items rendering lands once that backend exists.
 */
export function FashionWishlistPage() {
  return (
    <FashionStorefrontLayout>
      <section
        className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center"
        style={{ color: "var(--brand-primary)" }}
      >
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Your Wishlist
        </h1>
        <p className="text-sm opacity-60">
          Items you favorite will be saved here.
        </p>
        <Link
          href="/products"
          className="mt-2 rounded-2xl px-8 py-3.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          Browse Products
        </Link>
      </section>
    </FashionStorefrontLayout>
  );
}
