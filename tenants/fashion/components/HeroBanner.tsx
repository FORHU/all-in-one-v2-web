import Link from "next/link";
import { fashionConfig } from "../tenant.config";

/**
 * Fashion — homepage hero banner.
 * Editorial/minimal treatment: centered, eyebrow label, high-contrast ink
 * CTA. Example of a Tier 3 tenant-specific override component (see
 * shared/tenant/resolveTenantComponent.ts) — its layout genuinely diverges
 * from the other tenants' heroes, not just its theme colors.
 */
export function HeroBanner() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-6 px-6 py-28 text-center sm:py-36"
      style={{ backgroundColor: "var(--brand-secondary)" }}
    >
      <span
        className="rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
        style={{
          borderColor: "var(--brand-primary)",
          color: "var(--brand-primary)",
        }}
      >
        New Season
      </span>
      <h1
        className="max-w-2xl text-5xl font-bold tracking-tight sm:text-7xl"
        style={{
          color: "var(--brand-primary)",
          fontFamily: "var(--font-heading)",
        }}
      >
        {fashionConfig.name}
      </h1>
      <p
        className="max-w-xl text-base opacity-70 sm:text-lg"
        style={{
          color: "var(--brand-primary)",
          fontFamily: "var(--font-body)",
        }}
      >
        {fashionConfig.seo.description}
      </p>
      <Link
        href="/products"
        className="mt-2 rounded-full px-10 py-3.5 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "var(--brand-primary)",
          color: "var(--brand-secondary)",
        }}
      >
        Shop Now
      </Link>
    </section>
  );
}
