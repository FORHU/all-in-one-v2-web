export const cartKeys = {
  all: ["storefront", "cart"] as const,
  current: () => [...cartKeys.all, "current"] as const,
} as const;
