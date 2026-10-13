import Image from "next/image";
import Link from "next/link";
import { beautyConfig } from "../tenant.config";
import {
  beautyInstrumentSerif,
  beautyManrope,
  BEAUTY_MIRROR_COLORS as COLORS,
} from "../theme";

const glassBlur = {
  backdropFilter: "blur(26px) saturate(170%)",
  WebkitBackdropFilter: "blur(26px) saturate(170%)",
} as const;

/**
 * Beauty — storefront layout (header/footer/nav shell).
 * Consumes shared hooks/data only (e.g. features/storefront, features/cms) —
 * no business logic lives here, only presentation. Themes itself via the
 * --brand-primary/--brand-secondary/--font-* CSS variables set by
 * tenants/beauty/styles/theme.css, never via tenant checks in code.
 *
 * Re-matched to Main.dc.html's warm terracotta *glass* revision: a blurred,
 * oversized copy of the same ambient portrait used elsewhere on this tenant
 * sits fixed behind every page (position: relative + absolute inset:-12%
 * + filter blur, same technique the reference's `.bg-photo` uses), with a
 * translucent cream veil over it so foreground text stays legible. The
 * header is now a floating frosted-glass pill (`.glass` in the reference)
 * instead of a flat bottom-bordered bar, with nav links as glass pills and
 * a solid "BAG" button — Account links to the real /account; there's no
 * dedicated wishlist/saved page yet, so (unlike the reference's icon row)
 * no "Saved" icon button is rendered here — the home hero's own real
 * "N Saved" eyebrow already covers that honestly (see MirrorShelfHero).
 *
 * `hideFooter` — the reference's own Main.dc.html has no footer/bottom-nav
 * row at all; its "Mirror Mode" dashboard is meant to read as a single
 * self-contained screen, not a scrolling page. HomePage.tsx passes this so
 * the home route matches that (scrolling ends right after the 3-column
 * hero); every other beauty page keeps the real copyright footer.
 */
export function BeautyStorefrontLayout({
  children,
  hideFooter = false,
}: {
  children: React.ReactNode;
  hideFooter?: boolean;
}) {
  return (
    <div
      className={`relative flex min-h-screen flex-col overflow-hidden ${beautyInstrumentSerif.variable} ${beautyManrope.variable}`}
      style={{
        fontFamily: "var(--font-body)",
        backgroundColor: "var(--brand-secondary)",
        color: "var(--brand-primary)",
      }}
    >
      <div
        className="pointer-events-none absolute -inset-[12%]"
        style={{
          filter: "blur(70px) saturate(140%)",
          transform: "scale(1.05)",
        }}
        aria-hidden="true"
      >
        <Image
          src="https://images.unsplash.com/photo-1709477542170-f11ee7d471a0?w=1200&q=60"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: "rgba(248,238,230,0.35)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-4 pt-5 sm:px-10">
          <div
            className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-[22px] px-4 py-2.5 sm:px-6"
            style={{
              backgroundColor: COLORS.glassBg,
              border: `1px solid ${COLORS.glassBorder}`,
              boxShadow:
                "0 1px 0 rgba(255,255,255,.7) inset, 0 18px 40px -18px rgba(70,35,20,.28)",
              ...glassBlur,
            }}
          >
            <Link
              href="/"
              className="text-[28px] leading-none"
              style={{
                color: "var(--brand-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {beautyConfig.name}
              <span style={{ fontStyle: "italic", color: COLORS.accent }}>
                .
              </span>
            </Link>
            {beautyConfig.nav.length > 0 && (
              <nav className="hidden items-center gap-0.5 md:flex">
                {beautyConfig.nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-3.5 py-2.5 text-[13px] font-semibold uppercase tracking-wide transition-colors hover:text-current"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                aria-label="Account"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: COLORS.glassBg,
                  border: `1px solid ${COLORS.glassBorder}`,
                  color: COLORS.ink,
                  ...glassBlur,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
                </svg>
              </Link>
              <Link
                href="/cart"
                className="flex h-11 items-center gap-2 rounded-full px-[18px] text-[13px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: COLORS.ink, color: COLORS.accentInk }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 8h14l-1 13H6z" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
                Bag
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {!hideFooter && (
          <footer className="px-4 py-8 sm:px-10">
            <div
              className="mx-auto max-w-7xl text-sm opacity-70"
              style={{ color: "var(--brand-primary)" }}
            >
              © {new Date().getFullYear()} {beautyConfig.name}. All rights
              reserved.
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
