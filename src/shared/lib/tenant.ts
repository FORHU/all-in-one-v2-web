const DEFAULT_TENANT_SLUG = "fashion";

/**
 * Client-side tenant slug lookup for use in `shared/lib/http.ts` and any
 * other browser-only code that needs to scope a request to the active
 * tenant. Reads the `data-tenant` attribute `app/layout.tsx` already
 * stamps on `<html>` (resolved server-side by `middleware.ts`) instead of
 * duplicating tenant-resolution logic here — this file intentionally does
 * NOT import `tenants/registry.ts` (shared/ must stay tenant-agnostic).
 */
export function getTenantSlug(): string {
  if (typeof document === "undefined") return DEFAULT_TENANT_SLUG;
  return (
    document.documentElement.getAttribute("data-tenant") ?? DEFAULT_TENANT_SLUG
  );
}
