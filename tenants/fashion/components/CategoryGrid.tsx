import Link from "next/link";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { fashionCategories } from "../data/categories";

/**
 * Fashion — homepage featured-category grid.
 * Static placeholder categories until features/storefront's useCategories()
 * is backed by a real API — see categories.client.ts.
 * Tiles are dark (black backdrop + gradient scrim + white overlay text)
 * rather than plain white cards — the black/white theme otherwise only
 * shows up in the hero and footer, leaving everything between feeling flat.
 */
export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{
              color: "var(--brand-primary)",
              fontFamily: "var(--font-heading)",
            }}
          >
            Shop by Category
          </h2>
          <div
            className="mt-3 h-0.5 w-10"
            style={{ backgroundColor: "var(--brand-primary)" }}
          />
        </div>
        <Link
          href="/categories"
          className="text-sm font-semibold underline"
          style={{ color: "var(--brand-primary)" }}
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {fashionCategories.map(({ slug, label, count }) => (
          <Link
            key={slug}
            href={`/categories/${slug}`}
            className="group relative block overflow-hidden rounded-2xl"
          >
            <div
              className="relative aspect-[3/4] w-full overflow-hidden"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              <ImagePlaceholder
                label={`Category: ${label}`}
                aspect="3/4"
                className="h-full w-full text-white transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,.8) 0%, rgba(0,0,0,.05) 55%, transparent 75%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="text-[15px] font-bold text-white">{label}</div>
                <div className="mt-0.5 text-xs text-white/70">
                  {count} items
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
