import { NextRequest, NextResponse } from "next/server";
import { getTenantSlugByDomain } from "@/tenants/registry";

/**
 * Multi-tenant resolution middleware.
 *
 * Resolves the active tenant slug from the request, mirroring the
 * precedence order used by all-in-one-v2-api's tenant.middleware.ts:
 *   1. custom domain        addictstyle.com, askmebeauty.com, ...
 *   2. x-tenant-slug header (tools, local dev, server-to-server)
 *   3. default tenant       (dev convenience only)
 *
 * The resolved slug is forwarded downstream as the `x-tenant-slug` request
 * header so `tenants/registry.ts` can be looked up in layouts/pages without
 * threading the slug through every prop.
 */
const DEFAULT_TENANT_SLUG = "fashion";

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0];

  const tenantSlug =
    getTenantSlugByDomain(host) ??
    request.headers.get("x-tenant-slug") ??
    DEFAULT_TENANT_SLUG;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", tenantSlug);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
