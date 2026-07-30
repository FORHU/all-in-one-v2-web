/**
 * Fashion — auto-scrolling brand-partner strip.
 * Static content, no backend model needed. Duplicated once so the CSS
 * marquee loop (translateX(-50%), see globals.css) reads as seamless.
 */
const brands = ["VOGUE", "ELLE", "GQ", "HARPER’S", "WWD", "DAZED"];
const brandLoop = [...brands, ...brands];

export function BrandMarquee() {
  return (
    <section
      className="overflow-hidden border-y py-10"
      style={{
        borderColor:
          "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
      }}
    >
      <div className="animate-marquee flex w-max gap-24">
        {brandLoop.map((brand, i) => (
          <div
            key={`${brand}-${i}`}
            className="flex-none text-xl font-extrabold tracking-wide"
            style={{
              color:
                "color-mix(in srgb, var(--brand-primary) 30%, transparent)",
            }}
          >
            {brand}
          </div>
        ))}
      </div>
    </section>
  );
}
