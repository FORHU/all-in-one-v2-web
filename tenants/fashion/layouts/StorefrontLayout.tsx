"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, Sun, Moon } from "lucide-react";
import { useCartUIStore } from "@/features/storefront/stores/cart.store";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { fashionConfig } from "../tenant.config";
import { AddictStyleLogo } from "../assets/AddictStyleLogo";
import { CartDrawer } from "../components/CartDrawer";
import { useFashionColorMode } from "../stores/colorMode.store";
import { FASHION_COLOR_VARS } from "../utils/colorModeVars";
import {
  fashionDidone,
  fashionInter,
  fashionGrainBackgroundImage,
  fashionVignetteBackgroundImage,
} from "../theme";

const FOOTER_LINKS = {
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Sustainability", href: "#" },
  ],
  Support: [
    { label: "Contact", href: "#" },
    { label: "Shipping", href: "#" },
    { label: "Returns", href: "/returns" },
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

const ANNOUNCEMENT_MESSAGES = [
  "Free Shipping Over $75",
  "New Arrivals Weekly",
  "Easy 30-Day Returns",
];
// The CSS marquee loop (translateX(-50%), see globals.css) shifts by half
// of the rendered content's width, so one "lap" of ANNOUNCEMENT_MESSAGES
// needs to be wider than any realistic viewport, or the reset point shows
// a gap of bare background before it repeats. Repeating the short 3-item
// set 8x (then doubling that for the seamless loop) keeps a lap comfortably
// wider than even ultra-wide screens.
const ANNOUNCEMENT_SET: string[] = Array.from(
  { length: 8 },
  () => ANNOUNCEMENT_MESSAGES,
).flat();
const ANNOUNCEMENT_LOOP = [...ANNOUNCEMENT_SET, ...ANNOUNCEMENT_SET];

/**
 * Fashion — storefront layout (header/footer/nav shell).
 * Consumes shared hooks/data only (e.g. features/storefront, features/cms) —
 * no business logic lives here, only presentation. Themes itself via the
 * --brand-primary/--brand-secondary/--font-* CSS variables set by
 * tenants/fashion/styles/theme.css, never via tenant checks in code.
 *
 * Centered logo with nav-left / icons-right zones and a dark announcement
 * bar above the header. Search is a compact inline input (subtle, expands
 * on focus) rather than a full-width bar — still UI-only, no
 * product-search wiring yet. Mega-menus (Women/Men submenus in the design
 * reference) are deferred; nav renders as flat links until that
 * interaction is scoped.
 *
 * hideSearch/hideFooter: used by pages/AccountPage.tsx, which wants the
 * same header (nav, icons, cart) but not the search input or the
 * marketing footer — rather than duplicate the header/nav/cart-drawer
 * wiring in a second layout component.
 */
export function FashionStorefrontLayout({
  children,
  hideSearch = false,
  hideFooter = false,
}: {
  children: React.ReactNode;
  hideSearch?: boolean;
  hideFooter?: boolean;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const toggleDrawer = useCartUIStore((s) => s.toggleDrawer);
  const cartCount = useLocalCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );
  const colorMode = useFashionColorMode((s) => s.mode);
  const toggleColorMode = useFashionColorMode((s) => s.toggle);

  // useLocalCartStore/useFashionColorMode persist to localStorage, which
  // isn't available during SSR — gating both behind a mount flag avoids a
  // hydration mismatch between the server's default render and the
  // client's rehydrated values.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const mode = hasMounted ? colorMode : "dark";

  // Wave-reveal the mode switch from the clicked point, via the View
  // Transitions API (Chrome/Edge/Safari). Falls back to an instant toggle
  // on browsers without support (Firefox) rather than skipping the toggle.
  const handleToggleColorMode = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const x = event.clientX;
    const y = event.clientY;
    const startViewTransition = (
      document as Document & {
        startViewTransition?: (callback: () => void) => {
          ready: Promise<void>;
        };
      }
    ).startViewTransition?.bind(document);

    if (!startViewTransition) {
      toggleColorMode();
      return;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = startViewTransition(() => {
      toggleColorMode();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <div
      className={`flex min-h-screen flex-col ${fashionDidone.variable} ${fashionInter.variable}`}
      style={{
        ...FASHION_COLOR_VARS[mode],
        fontFamily: "var(--font-body)",
        backgroundColor: "var(--brand-secondary)",
        // Grain/vignette are tuned specifically for the light-mode cream
        // palette (warm-white highlight, warm-brown shadow) — applying them
        // in dark mode too overlaid that warm coloring on near-black,
        // producing a hazy grey/brown smear instead of a clean dark
        // background. Light-mode only. Vignette layers are deliberately
        // left at their default size — no explicit backgroundSize/Position
        // — so each stretches across the *entire* element as one
        // continuous image with no internal edge anywhere to seam against.
        // Two earlier approaches (`background-attachment:fixed`, then
        // capping the layer at a fixed vh height) both left a visible seam
        // at some scroll position — fixed because it repaints the same
        // gradient at every scroll position, and a capped height because
        // the box's own edge was still perceptible even with a
        // fully-transparent color stop there. Only grain still gets an
        // explicit size, since it's meant to visibly tile at a small scale.
        ...(mode === "light"
          ? {
              backgroundImage: `${fashionVignetteBackgroundImage}, ${fashionGrainBackgroundImage}`,
              backgroundRepeat: "no-repeat, no-repeat, repeat",
              backgroundSize: "auto, auto, 180px 180px",
            }
          : {}),
        color: "var(--brand-primary)",
      }}
    >
      <header
        className="sticky top-0 z-40"
        style={{
          backgroundColor: "var(--brand-secondary)",
          boxShadow:
            "0 1px 24px color-mix(in srgb, var(--brand-primary) 7%, transparent)",
        }}
      >
        <div
          className="overflow-hidden border-b py-2"
          style={{
            backgroundColor: "var(--brand-secondary)",
            color: "var(--brand-primary)",
            borderColor:
              "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
          }}
        >
          {/* animate-marquee's default 22s (see globals.css) is tuned for
              BrandMarquee's shorter content — this strip is 8x longer
              (see ANNOUNCEMENT_SET), so it needs a slower duration to keep
              the same visual pace rather than covering more ground in the
              same time. */}
          <div
            className="animate-marquee flex w-max gap-16"
            style={{ animationDuration: "70s" }}
          >
            {ANNOUNCEMENT_LOOP.map((message, i) => (
              <span
                key={`${message}-${i}`}
                className="flex-none text-[11px] font-semibold uppercase tracking-wider sm:text-xs"
              >
                {message}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-6 sm:px-10">
          <div className="flex items-center">
            {fashionConfig.nav.length > 0 && (
              <nav className="hidden items-center gap-7 md:flex">
                {fashionConfig.nav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className="border-b-2 pb-1 text-sm font-semibold transition-opacity hover:opacity-100"
                      style={{
                        color: "var(--brand-primary)",
                        opacity: isActive ? 1 : 0.7,
                        borderColor: isActive
                          ? "var(--brand-primary)"
                          : "transparent",
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
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

          <Link
            href="/"
            className={`justify-self-center transition-colors ${
              mode === "dark" ? "text-[#f2e3c6] hover:text-[#E8DA97]" : ""
            }`}
            style={
              mode === "dark" ? undefined : { color: "var(--brand-primary)" }
            }
          >
            <AddictStyleLogo
              role="img"
              aria-label={fashionConfig.name}
              className="h-14 w-auto sm:h-16"
            />
          </Link>

          <div className="flex items-center justify-end gap-2">
            {!hideSearch && (
              <div className="relative hidden lg:block">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-50"
                  style={{ color: "var(--brand-primary)" }}
                />
                {/* TODO: wire to features/storefront product-search once available */}
                <input
                  type="search"
                  placeholder="Search..."
                  className="h-10 w-36 rounded-full border-none pl-9 pr-3 text-xs outline-none transition-all duration-200 focus:w-52"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--brand-primary) 5%, var(--brand-secondary))",
                    color: "var(--brand-primary)",
                  }}
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleToggleColorMode}
              aria-label={
                mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
              className="flex h-10 w-10 items-center justify-center rounded-full outline-none transition-colors hover:bg-current/[0.06] focus-visible:ring-2 focus-visible:ring-current/30"
              style={{ color: "var(--brand-primary)" }}
            >
              {mode === "dark" ? (
                <Sun className="h-[19px] w-[19px]" strokeWidth={2} />
              ) : (
                <Moon className="h-[19px] w-[19px]" strokeWidth={2} />
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
              onClick={toggleDrawer}
              aria-label="Open cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full outline-none transition-colors hover:bg-current/[0.06] focus-visible:ring-2 focus-visible:ring-current/30"
              style={{ color: "var(--brand-primary)" }}
            >
              <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={2} />
              {hasMounted && cartCount > 0 && (
                <span
                  className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    color: "var(--brand-secondary)",
                  }}
                >
                  {cartCount}
                </span>
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
            {fashionConfig.nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-center gap-2 py-2 text-sm font-semibold"
                  style={{
                    color: "var(--brand-primary)",
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: "var(--brand-primary)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {!hideFooter && (
        <footer
          className="py-16"
          style={{
            backgroundColor: "var(--brand-secondary)",
            color: "var(--brand-primary)",
          }}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 border-b border-current/15 px-6 pb-12 sm:grid-cols-3 lg:grid-cols-5">
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
                  className="rounded-md border border-current/25 px-2.5 py-1 text-[11px] font-semibold opacity-75"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </footer>
      )}

      <CartDrawer />
    </div>
  );
}
