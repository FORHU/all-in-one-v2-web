import { fetcher } from "@/shared/lib/http";
import {
  CollectionsEnvelopeSchema,
  CollectionEnvelopeSchema,
  type Collection,
  type CollectionsResponse,
  type CollectionType,
} from "../contracts/collections.contract";

/**
 * Storefront — Collections API client.
 * Requests are scoped to the active tenant via the x-tenant-slug header,
 * attached automatically by shared/lib/http.ts's fetcher.
 */

export const getCollections = async (
  type?: CollectionType,
): Promise<CollectionsResponse> => {
  const query = type ? `?type=${type}` : "";
  const raw = await fetcher<unknown>(`/api/v2/collections${query}`);
  return CollectionsEnvelopeSchema.parse(raw).data;
};

export const getCollectionBySlug = async (
  slug: string,
): Promise<Collection> => {
  const raw = await fetcher<unknown>(`/api/v2/collections/slug/${slug}`);
  return CollectionEnvelopeSchema.parse(raw).data;
};
