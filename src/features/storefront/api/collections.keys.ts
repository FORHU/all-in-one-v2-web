import type { CollectionType } from "../contracts/collections.contract";

export const collectionsKeys = {
  all: ["storefront", "collections"] as const,
  list: (type?: CollectionType) =>
    [...collectionsKeys.all, "list", type ?? "all"] as const,
  detail: (slug: string) => [...collectionsKeys.all, "detail", slug] as const,
} as const;
