export const notificationsKeys = {
  all: ["storefront", "notifications"] as const,
  my: (tenantSlug: string) =>
    [...notificationsKeys.all, "my", tenantSlug] as const,
} as const;
