import Link from "next/link";
import { outdoorConfig } from "../tenant.config";

/**
 * Outdoor — homepage hero banner.
 * Bold/rugged treatment: full-bleed forest-green backdrop with an angular
 * clipped bottom edge. Example of a Tier 3 tenant-specific override
 * component (see shared/tenant/resolveTenantComponent.ts) — its layout
 * genuinely diverges from the other tenants' heroes, not just its theme
 * colors.
 */
export function HeroBanner() {
  return (
    <section
      className="relative px-6 pb-20 pt-24 text-center sm:pb-28 sm:pt-32"
      style={{
        backgroundColor: "var(--brand-primary)",
        clipPath: "polygon(0 0, 100% 0, 100% 92%, 0 100%)",
      }}
    >
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <h1
          className="text-4xl font-black uppercase tracking-wide sm:text-6xl"
          style={{
            color: "var(--brand-secondary)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {outdoorConfig.name}
        </h1>
        <p
          className="text-base opacity-90 sm:text-lg"
          style={{
            color: "var(--brand-secondary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {outdoorConfig.seo.description}
        </p>
        <Link
          href="/products"
          className="px-10 py-3.5 text-sm font-bold uppercase tracking-wide transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--brand-secondary)",
            color: "var(--brand-primary)",
          }}
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
