import Link from "next/link";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";

/**
 * Fashion — account page.
 * Initial shell only: sign-in prompt. Real authenticated account views
 * (orders, addresses, details) land once features/auth session state is
 * read here to branch signed-in vs signed-out.
 */
export function FashionAccountPage() {
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
          Your Account
        </h1>
        <p className="text-sm opacity-60">
          Sign in to view your orders, saved addresses, and account details.
        </p>
        <Link
          href="/login"
          className="mt-2 rounded-2xl px-8 py-3.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          Sign In
        </Link>
      </section>
    </FashionStorefrontLayout>
  );
}
