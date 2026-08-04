"use client";

/**
 * Global provider composition root.
 * TODO: compose QueryProvider (shared/lib/providers/query-provider.tsx),
 * a TenantProvider (reads the slug set by root middleware.ts and looks it
 * up in tenants/registry.ts), and any other app-wide providers here, then
 * wire this into src/app/layout.tsx in place of the current direct
 * composition.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
