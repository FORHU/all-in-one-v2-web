import Link from "next/link";
import { beautyConfig } from "../tenant.config";
import { beautyCormorant, beautyPlexMono } from "../theme";

/**
 * Beauty — storefront layout (header/footer/nav shell).
 * Consumes shared hooks/data only (e.g. features/storefront, features/cms) —
 * no business logic lives here, only presentation. Themes itself via the
 * --brand-primary/--brand-secondary/--font-* CSS variables set by
 * tenants/beauty/styles/theme.css, never via tenant checks in code.
 */
export function BeautyStorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex min-h-screen flex-col ${beautyCormorant.variable} ${beautyPlexMono.variable}`}
      style={{
        fontFamily: "var(--font-body)",
        backgroundColor: "var(--brand-secondary)",
        color: "var(--brand-primary)",
      }}
    >
      <header
        className="border-b"
        style={{
          borderColor:
            "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
            style={{
              color: "var(--brand-primary)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {beautyConfig.name}
          </Link>
          {beautyConfig.nav.length > 0 && (
            <nav className="hidden items-center gap-8 md:flex">
              {beautyConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium opacity-70 transition-opacity hover:opacity-100"
                  style={{ color: "var(--brand-primary)" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer
        className="border-t py-8"
        style={{
          borderColor:
            "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
        }}
      >
        <div
          className="mx-auto max-w-7xl px-6 text-sm opacity-60"
          style={{ color: "var(--brand-primary)" }}
        >
          © {new Date().getFullYear()} {beautyConfig.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
