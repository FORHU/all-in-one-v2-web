import Link from "next/link";
import { livingConfig } from "../tenant.config";

/**
 * Living — homepage hero banner.
 * Warm/cozy treatment: split layout, copy beside a gradient "room photo"
 * placeholder block. Example of a Tier 3 tenant-specific override component
 * (see shared/tenant/resolveTenantComponent.ts) — its layout genuinely
 * diverges from the other tenants' heroes, not just its theme colors.
 */
export function HeroBanner() {
  return (
    <section
      className="px-6 py-20 sm:py-28"
      style={{ backgroundColor: "var(--brand-secondary)" }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 sm:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{
              color: "var(--brand-primary)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {livingConfig.name}
          </h1>
          <p
            className="text-base opacity-70 sm:text-lg"
            style={{
              color: "var(--brand-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            {livingConfig.seo.description}
          </p>
          <Link
            href="/products"
            className="rounded-lg px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "var(--brand-secondary)",
            }}
          >
            Shop Now
          </Link>
        </div>
        <div
          className="aspect-[4/3] w-full rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 35%, transparent), color-mix(in srgb, var(--brand-primary) 10%, transparent))",
          }}
        />
      </div>
    </section>
  );
}
