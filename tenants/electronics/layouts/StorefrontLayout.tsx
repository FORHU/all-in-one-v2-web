"use client";

import Link from "next/link";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import { electronicsConfig } from "../tenant.config";
import {
  DIGITFRIEND_COLORS as COLORS,
  digitfriendSpaceGrotesk,
  digitfriendDmSans,
  digitfriendJetBrainsMono,
} from "../theme";

/**
 * DigitFriend — storefront shell, matching the "digitfriend ui.html" design
 * reference's chrome: a dark announcement bar, a dark header (logo, nav,
 * decorative search, live wishlist/cart badges, a decorative account icon),
 * a light cream body, and a dark footer. Replaces the earlier "Circuit"
 * dark-theme shell entirely.
 *
 * The search input is still inert on purpose — there's no search feature
 * anywhere in this codebase (same reasoning as fashion's header search
 * box). The Wishlist button is also inert — no tenant in this app has a
 * dedicated wishlist page to send it to — but shows a *real* count from
 * useWishlistStore. Account and Cart are real links now: /account and
 * /cart both have electronics entries (AccountPage.tsx/CartPage.tsx,
 * wired into their route dispatch tables) — Account redirects to /login
 * itself when signed out, so the header doesn't need to branch on auth
 * state to decide where to send the click.
 */
export function ElectronicsStorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cartItems = useLocalCartStore((s) => s.items);
  const wishIds = useWishlistStore((s) => s.ids);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div
      className={`${digitfriendSpaceGrotesk.variable} ${digitfriendDmSans.variable} ${digitfriendJetBrainsMono.variable} flex min-h-screen flex-col`}
      style={{
        backgroundColor: COLORS.bg,
        fontFamily: "var(--font-body)",
        color: COLORS.ink,
      }}
    >
      {/* Announcement bar */}
      <div
        className="flex flex-wrap justify-center gap-7 border-b px-6 py-2.5 text-[13px]"
        style={{
          backgroundColor: COLORS.ink,
          color: COLORS.headerMuted,
          borderColor: COLORS.headerBorder,
          colorScheme: "dark",
        }}
      >
        <span>Free 2-day shipping on every order</span>
        <span style={{ color: COLORS.headerMutedSoft }} aria-hidden="true">
          /
        </span>
        <span>Extended warranty included</span>
        <span style={{ color: COLORS.headerMutedSoft }} aria-hidden="true">
          /
        </span>
        <span>24/7 support</span>
      </div>

      {/* Header */}
      <header
        style={{
          backgroundColor: COLORS.ink,
          color: "#ffffff",
          colorScheme: "dark",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-7 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-white no-underline"
          >
            <span
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
              style={{ backgroundColor: COLORS.accent }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.ink}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 4h6a7 7 0 0 1 0 14H7z" />
                <path d="M7 21v-3" />
              </svg>
            </span>
            <span
              className="text-xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-heading)",
                letterSpacing: "-0.02em",
              }}
            >
              {electronicsConfig.name}
            </span>
          </Link>

          <nav aria-label="Main" className="flex flex-wrap gap-5 text-[15px]">
            {electronicsConfig.nav.map((item, i) => (
              <a
                key={item.label}
                href={item.href}
                className="no-underline"
                style={{ color: i === 0 ? "#ffffff" : COLORS.headerMuted }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <form
            className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3.5"
            style={{
              flexBasis: "260px",
              backgroundColor: COLORS.headerPanelBg,
              border: `1px solid ${COLORS.headerPanelBorder}`,
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9aa0ab"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <label htmlFor="df-search" className="sr-only">
              Search products
            </label>
            <input
              id="df-search"
              type="search"
              placeholder="Search speakers, keyboards, webcams…"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#9aa0ab]"
            />
          </form>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Wishlist, ${wishIds.length} saved`}
              className="flex h-11 items-center gap-2 rounded-xl px-3 text-sm text-white"
              style={{ border: `1px solid ${COLORS.headerPanelBorder}` }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              {wishIds.length}
            </button>
            <Link
              href="/account"
              aria-label="Account"
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ border: `1px solid ${COLORS.headerPanelBorder}` }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </Link>
            <Link
              href="/cart"
              aria-label={`Cart, ${cartCount} items, $${cartTotal.toFixed(2)}`}
              className="flex h-11 items-center gap-2.5 rounded-xl px-3.5 font-bold no-underline"
              style={{ backgroundColor: "#ffffff", color: COLORS.ink }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.ink}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M2 3h3l2.5 12h12l2-8H6.2" />
              </svg>
              <span>${cartTotal.toFixed(2)}</span>
              <span
                className="flex min-w-[22px] items-center justify-center rounded-full px-1.5 text-xs"
                style={{
                  height: "22px",
                  backgroundColor: COLORS.accent,
                  color: COLORS.accentInk,
                }}
              >
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.bg,
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-10 px-6 py-12">
          <div className="flex min-w-[260px] flex-1 flex-col gap-2.5">
            <span
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {electronicsConfig.name}
            </span>
            <p
              className="max-w-[280px] text-[15px] leading-relaxed"
              style={{ color: COLORS.muted }}
            >
              Tech that just works — curated gear, shipped fast.
            </p>
          </div>
          <nav
            aria-label="Shop"
            className="flex min-w-[160px] flex-col gap-2.5 text-[15px]"
          >
            <span className="font-bold">Shop</span>
            <a
              href="#shop"
              className="no-underline"
              style={{ color: COLORS.muted }}
            >
              New arrivals
            </a>
            <a
              href="#shop"
              className="no-underline"
              style={{ color: COLORS.muted }}
            >
              Audio &amp; Sound
            </a>
            <a
              href="#shop"
              className="no-underline"
              style={{ color: COLORS.muted }}
            >
              Computer Peripherals
            </a>
            <a
              href="#shop"
              className="no-underline"
              style={{ color: COLORS.muted }}
            >
              Smart Home
            </a>
          </nav>
          <nav
            aria-label="Help"
            className="flex min-w-[160px] flex-col gap-2.5 text-[15px]"
          >
            <span className="font-bold">Help</span>
            <a
              href="#help"
              className="no-underline"
              style={{ color: COLORS.muted }}
            >
              Shipping
            </a>
            <a
              href="#help"
              className="no-underline"
              style={{ color: COLORS.muted }}
            >
              Returns
            </a>
            <a
              href="#help"
              className="no-underline"
              style={{ color: COLORS.muted }}
            >
              Warranty
            </a>
            <a
              href="#help"
              className="no-underline"
              style={{ color: COLORS.muted }}
            >
              Contact support
            </a>
          </nav>
        </div>
        <div
          className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-6 py-6 text-[13px]"
          style={{
            borderTop: `1px solid ${COLORS.border}`,
            color: COLORS.muted,
          }}
        >
          <span>
            © {new Date().getFullYear()} {electronicsConfig.name}
          </span>
          <span>Secure checkout · Encrypted payments</span>
        </div>
      </footer>
    </div>
  );
}
