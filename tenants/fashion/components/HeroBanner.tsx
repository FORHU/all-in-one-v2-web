import Link from "next/link";
import { ImageCarousel } from "@/shared/components/ImageCarousel";
import { fashionConfig } from "../tenant.config";
import heroImage1 from "../assets/homepage-image.jpg";
import heroImage3 from "../assets/homepage-image3.jpg";
import heroImage4 from "../assets/homepage-image4.jpg";

const heroImages = [
  { src: heroImage1, alt: "Autumn campaign — new season arrivals" },
  { src: heroImage3, alt: "Autumn campaign — new season arrivals" },
  { src: heroImage4, alt: "Autumn campaign — new season arrivals" },
];

/**
 * Fashion — homepage hero banner.
 * Full-bleed editorial photo carousel (see design reference at
 * tenants/fashion/Homepage.dc.html) — auto-advances through
 * data/heroImages every 6s, with arrow + dot controls (ImageCarousel).
 * Sized to fill the viewport below the sticky header (~96px, driven by the
 * logo image's height) so hero + header together occupy exactly one screen
 * on load.
 */
export function HeroBanner() {
  return (
    <section className="relative h-[calc(100vh-96px)] min-h-[480px] w-full overflow-hidden">
      <ImageCarousel images={heroImages} className="absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,.4) 0%, rgba(0,0,0,.1) 45%, transparent 70%)",
        }}
      />
      <div className="absolute bottom-16 left-8 z-20 flex max-w-lg flex-col gap-5 sm:left-16">
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
          The Autumn Edit is Here
        </h1>
        <p className="max-w-md text-base leading-relaxed text-white/85">
          {fashionConfig.seo.description}
        </p>
        <div className="flex flex-wrap gap-3.5">
          <Link
            href="/products"
            className="rounded-2xl bg-white px-7 py-4 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Shop Collection
          </Link>
          <Link
            href="/categories"
            className="rounded-2xl border border-white/60 bg-white/15 px-7 py-4 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            Explore New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}
