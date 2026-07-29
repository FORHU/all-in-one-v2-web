import Link from "next/link";
import { electronicsConfig } from "../tenant.config";

const specs = ["Free 2-Day Shipping", "Extended Warranty", "24/7 Support"];

/**
 * Electronics — homepage hero banner.
 * Dark/tech treatment: full-bleed dark backdrop, dot-grid pattern, spec
 * tags. Example of a Tier 3 tenant-specific override component (see
 * shared/tenant/resolveTenantComponent.ts) — its layout genuinely diverges
 * from the other tenants' heroes, not just its theme colors.
 */
export function HeroBanner() {
  return (
    <section
      className="relative overflow-hidden px-6 py-28 text-center sm:py-36"
      style={{
        backgroundColor: "color-mix(in srgb, var(--brand-primary) 25%, black)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(var(--brand-secondary) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <h1
          className="text-4xl font-bold tracking-tight sm:text-6xl"
          style={{
            color: "var(--brand-secondary)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {electronicsConfig.name}
        </h1>
        <p
          className="text-base opacity-80 sm:text-lg"
          style={{
            color: "var(--brand-secondary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {electronicsConfig.seo.description}
        </p>
        <Link
          href="/products"
          className="rounded-md px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--brand-primary)",
            color: "var(--brand-secondary)",
          }}
        >
          Shop Now
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {specs.map((spec) => (
            <span
              key={spec}
              className="rounded-full border px-3 py-1 text-xs font-medium"
              style={{
                borderColor: "var(--brand-secondary)",
                color: "var(--brand-secondary)",
              }}
            >
              {spec}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
