"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCartUIStore } from "@/features/storefront/stores/cart.store";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { fashionConfig } from "../tenant.config";
import logo from "../assets/addictstyle-logo.png";
import { CartDrawer } from "../components/CartDrawer";

const FOOTER_LINKS = {
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Sustainability", href: "#" },
  ],
  Support: [
    { label: "Contact", href: "#" },
    { label: "Shipping", href: "#" },
    { label: "Returns", href: "#" },
    { label: "FAQ", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
  Social: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "TikTok", href: "#" },
  ],
};

const PAYMENT_METHODS = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"];

/**
 * Fashion — storefront layout (header/footer/nav shell).
 * Consumes shared hooks/data only (e.g. features/storefront, features/cms) —
 * no business logic lives here, only presentation. Themes itself via the
 * --brand-primary/--brand-secondary/--font-* CSS variables set by
 * tenants/fashion/styles/theme.css, never via tenant checks in code.
 *
 * Search is UI-only for now — no product-search wiring yet.
 * Mega-menus (Women/Men submenus in the design reference) are deferred; nav
 * renders as flat links until that interaction is scoped.
 */
export function FashionStorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const toggleDrawer = useCartUIStore((s) => s.toggleDrawer);
  const cartCount = useLocalCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );

  // useLocalCartStore persists to localStorage, which isn't available
  // during SSR — gating the badge behind a mount flag avoids a hydration
  // mismatch between the server's empty render and the client's rehydrated
  // cart count.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{
          borderColor:
            "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
          backgroundColor:
            "color-mix(in srgb, var(--brand-secondary) 92%, transparent)",
        }}
      >
        <div className="flex items-center gap-8 px-6 py-5">
          <Link href="/" className="flex-none">
            <Image
              src={logo}
              alt={fashionConfig.name}
              className="h-12 w-auto sm:h-14"
              priority
            />
          </Link>

          {fashionConfig.nav.length > 0 && (
            <nav className="hidden flex-none items-center gap-7 md:flex">
              {fashionConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-semibold opacity-70 transition-opacity hover:opacity-100"
                  style={{ color: "var(--brand-primary)" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="hidden flex-1 justify-center md:flex">
            <div className="relative w-full max-w-2xl">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
                style={{ color: "var(--brand-primary)" }}
              />
              {/* TODO: wire to features/storefront product-search once available */}
              <input
                type="search"
                placeholder="Search products, brands..."
                className="h-11 w-full rounded-full border-none pl-11 pr-4 text-sm outline-none"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--brand-primary) 6%, white)",
                  color: "var(--brand-primary)",
                }}
              />
            </div>
          </div>

          <div className="flex flex-none items-center gap-1">
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="hidden h-10 w-10 items-center justify-center rounded-full outline-none transition-colors hover:bg-current/[0.06] focus-visible:ring-2 focus-visible:ring-current/30 sm:flex"
              style={{ color: "var(--brand-primary)" }}
            >
              <Heart className="h-[19px] w-[19px]" strokeWidth={2} />
            </Link>
            <button
              type="button"
              onClick={toggleDrawer}
              aria-label="Open cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full outline-none transition-colors hover:bg-current/[0.06] focus-visible:ring-2 focus-visible:ring-current/30"
              style={{ color: "var(--brand-primary)" }}
            >
              <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={2} />
              {hasMounted && cartCount > 0 && (
                <span
                  className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden h-10 w-10 items-center justify-center rounded-full outline-none transition-colors hover:bg-current/[0.06] focus-visible:ring-2 focus-visible:ring-current/30 sm:flex"
              style={{ color: "var(--brand-primary)" }}
            >
              <User className="h-[19px] w-[19px]" strokeWidth={2} />
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileNavOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full outline-none transition-colors hover:bg-current/[0.06] focus-visible:ring-2 focus-visible:ring-current/30 md:hidden"
              style={{ color: "var(--brand-primary)" }}
            >
              {isMobileNavOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {isMobileNavOpen && (
          <nav
            className="flex flex-col gap-1 border-t px-6 py-4 md:hidden"
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
            }}
          >
            {fashionConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileNavOpen(false)}
                className="py-2 text-sm font-semibold"
                style={{ color: "var(--brand-primary)" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer
        className="py-16"
        style={{
          backgroundColor: "var(--brand-primary)",
          color: "var(--brand-secondary)",
        }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 border-b border-white/15 px-6 pb-12 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <div
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {fashionConfig.name}
            </div>
            <p className="max-w-[260px] text-[13px] leading-relaxed opacity-60">
              {fashionConfig.seo.description}
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="flex flex-col gap-2.5">
              <div className="text-[12px] font-bold uppercase tracking-wide opacity-50">
                {heading}
              </div>
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13px] opacity-80 transition-opacity hover:opacity-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 pt-8">
          <div className="text-xs opacity-50">
            © {new Date().getFullYear()} {fashionConfig.name}. All rights
            reserved.
          </div>
          <div className="flex flex-wrap gap-2.5">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method}
                className="rounded-md border border-white/25 px-2.5 py-1 text-[11px] font-semibold opacity-75"
              >
                {method}
              </div>
            ))}
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}
