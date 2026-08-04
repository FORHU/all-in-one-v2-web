export const cmsKeys = {
  all: ["cms", "page"] as const,
  bySlug: (slug: string) => [...cmsKeys.all, slug] as const,
} as const;
