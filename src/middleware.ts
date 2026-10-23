import { NextRequest, NextResponse } from "next/server";
import { getTenantConfig, getTenantSlugByDomain } from "@/tenants/registry";

/**
 * Multi-tenant resolution middleware.
 *
 * Resolves the active tenant slug from the request, mirroring the
 * precedence order used by all-in-one-v2-api's tenant.middleware.ts:
 *   1. domain or subdomain  addictstyle.com, dev.askmebeauty.com, ...
 *   2. x-tenant-slug header (tools, local dev, server-to-server)
 *   3. default tenant       — local only, see resolveTenantSlug
 *
 * The resolved slug is forwarded downstream as the `x-tenant-slug` request
 * header so `tenants/registry.ts` can be looked up in layouts/pages without
 * threading the slug through every prop. A deployed request that resolves
 * to no tenant gets a 404 rather than silently serving the default one.
 */
const DEFAULT_TENANT_SLUG = "fashion";

/** Hosts that only ever mean "this machine" — never a real storefront. */
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

/** The Host header without its port; handles bracketed IPv6 ("[::1]:5001"). */
export function hostnameOf(hostHeader: string): string {
  const host = hostHeader.trim().toLowerCase();
  if (host.startsWith("[")) return host.slice(1, host.indexOf("]"));
  return host.split(":")[0];
}

/**
 * Domain/subdomain first, then a valid x-tenant-slug header. The default
 * tenant is only a fallback for `next dev` and loopback hosts — local work
 * and the deploy workflows' `curl http://127.0.0.1:<port>/` health check.
 * Anywhere else an unresolved host returns null (→ 404), so a missing or
 * mistyped tenant domain fails loudly instead of rendering fashion and
 * looking like it works.
 */
export function resolveTenantSlug({
  host,
  headerSlug,
  isDevServer,
}: {
  host: string;
  headerSlug: string | null;
  isDevServer: boolean;
}): string | null {
  const fromDomain = getTenantSlugByDomain(host);
  if (fromDomain) return fromDomain;

  const fromHeader = headerSlug?.trim().toLowerCase();
  if (fromHeader && getTenantConfig(fromHeader)) return fromHeader;

  if (isDevServer || LOOPBACK_HOSTS.has(host)) return DEFAULT_TENANT_SLUG;
  return null;
}

export function middleware(request: NextRequest) {
  const host = hostnameOf(request.headers.get("host") ?? "");
  const tenantSlug = resolveTenantSlug({
    host,
    headerSlug: request.headers.get("x-tenant-slug"),
    isDevServer: process.env.NODE_ENV === "development",
  });

  if (!tenantSlug) {
    return new NextResponse(`Unknown storefront: ${host || "(no host)"}`, {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", tenantSlug);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
