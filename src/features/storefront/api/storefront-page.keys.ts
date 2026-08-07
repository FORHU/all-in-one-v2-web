export const storefrontPageKeys = {
  all: ["storefront", "page"] as const,
  detail: (slug: string) => [...storefrontPageKeys.all, slug] as const,
} as const;
