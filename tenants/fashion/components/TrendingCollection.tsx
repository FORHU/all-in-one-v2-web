import Link from "next/link";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";

/**
 * Fashion — homepage editorial storytelling blocks.
 * Copy/imagery are static curated content, same as the design reference —
 * no backend model backs these (they read as merchandising, not catalog
 * data).
 */
const collections = [
  {
    eyebrow: "TRENDING NOW",
    title: "The Tailored Line",
    copy: "Structured silhouettes reimagined in fluid, breathable fabrics — built for a wardrobe that moves through every season without compromise.",
    imageLabel: "Editorial: The Tailored Line",
    href: "/categories/women",
    imageFirst: true,
  },
  {
    eyebrow: "JUST DROPPED",
    title: "Knitwear Reimagined",
    copy: "Soft-touch merino and responsibly sourced cashmere blends, cut for quiet layering from studio to street.",
    imageLabel: "Editorial: Knitwear Reimagined",
    href: "/categories/men",
    imageFirst: false,
  },
];

export function TrendingCollection() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-16 sm:gap-24">
      {collections.map(
        ({ eyebrow, title, copy, imageLabel, href, imageFirst }) => (
          <div
            key={title}
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14"
          >
            <div className={imageFirst ? "order-1" : "order-1 lg:order-2"}>
              <ImagePlaceholder
                label={imageLabel}
                aspect="4/3"
                className="h-[320px] w-full sm:h-[420px]"
              />
            </div>
            <div
              className={`flex max-w-md flex-col gap-4 ${
                imageFirst ? "order-2" : "order-2 lg:order-1"
              }`}
              style={{ color: "var(--brand-primary)" }}
            >
              <div className="text-xs font-bold tracking-widest opacity-60">
                {eyebrow}
              </div>
              <h3
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {title}
              </h3>
              <p className="text-[15px] leading-relaxed opacity-70">{copy}</p>
              <Link
                href={href}
                className="mt-2 self-start rounded-2xl px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--brand-secondary)",
                }}
              >
                Discover the Edit
              </Link>
            </div>
          </div>
        ),
      )}
    </section>
  );
}
