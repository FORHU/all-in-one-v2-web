/**
 * Outdoor — homepage featured-products section.
 * Renders skeleton placeholder cards (not fabricated product data) until
 * features/storefront's useProducts() is backed by a real API.
 */
const placeholderCards = Array.from({ length: 4 });

export function FeaturedProducts() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2
        className="mb-8 text-2xl font-bold tracking-tight"
        style={{
          color: "var(--brand-primary)",
          fontFamily: "var(--font-heading)",
        }}
      >
        Top Gear
      </h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {placeholderCards.map((_, i) => (
          <div key={i} className="animate-pulse">
            <div
              className="aspect-square w-full rounded-2xl"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
              }}
            />
            <div
              className="mt-3 h-3 w-3/4 rounded-full"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
              }}
            />
            <div
              className="mt-2 h-3 w-1/3 rounded-full"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
