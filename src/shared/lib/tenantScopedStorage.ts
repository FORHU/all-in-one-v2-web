import { createJSONStorage } from "zustand/middleware";

/**
 * Namespaces a Zustand `persist` store's localStorage key by the active
 * tenant, read from `<html data-tenant>` (set by src/app/layout.tsx from
 * the same x-tenant-slug middleware.ts resolves everywhere else) — without
 * requiring every store consumer to thread tenantSlug through as an
 * argument. Without this, every tenant-aware persisted store (cart,
 * wishlist, ...) would share one literal localStorage key across tenants:
 * harmless across real tenant domains (different origins, naturally
 * separate storage), but a real bug in local dev / any future same-origin
 * multi-tenant deployment, where a fashion shopper's cart and a beauty
 * shopper's cart would silently merge.
 *
 * Falls back to the bare `name` (no prefix) when `document` isn't
 * available (SSR) or no tenant is set — same key a pre-existing persisted
 * store already used, so this is a no-op for fashion's own already-shipped
 * data (data-tenant="fashion" on its own domain reproduces today's
 * literal "fashion-..." key exactly).
 */
export function tenantScopedStorage<T>() {
  return createJSONStorage<T>(() => ({
    getItem: (name) => localStorage.getItem(scopedKey(name)),
    setItem: (name, value) => localStorage.setItem(scopedKey(name), value),
    removeItem: (name) => localStorage.removeItem(scopedKey(name)),
  }));
}

function scopedKey(name: string): string {
  if (typeof document === "undefined") return name;
  const tenant = document.documentElement.dataset.tenant;
  return tenant ? `${tenant}-${name}` : name;
}
