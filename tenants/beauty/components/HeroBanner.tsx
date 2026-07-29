import Link from "next/link";
import { beautyConfig } from "../tenant.config";

/**
 * Beauty — homepage hero banner.
 * Soft/organic treatment: left-aligned copy over blurred blob shapes.
 * Example of a Tier 3 tenant-specific override component (see
 * shared/tenant/resolveTenantComponent.ts) — its layout genuinely diverges
 * from the other tenants' heroes, not just its theme colors.
 */
export function HeroBanner() {
  return (
    <section
      className="relative overflow-hidden px-6 py-24 sm:py-32"
      style={{ backgroundColor: "var(--brand-secondary)" }}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: "var(--brand-primary)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-10 h-56 w-56 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: "var(--brand-primary)" }}
      />
      <div className="relative mx-auto flex max-w-md flex-col items-start gap-6 sm:pl-6">
        <h1
          className="text-4xl font-bold tracking-tight sm:text-6xl"
          style={{
            color: "var(--brand-primary)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {beautyConfig.name}
        </h1>
        <p
          className="text-base opacity-70 sm:text-lg"
          style={{
            color: "var(--brand-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {beautyConfig.seo.description}
        </p>
        <Link
          href="/products"
          className="rounded-full px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--brand-primary)",
            color: "var(--brand-secondary)",
          }}
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
