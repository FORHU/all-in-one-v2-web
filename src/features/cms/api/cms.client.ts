import type { Page } from "../contracts/cms.contract";

/**
 * CMS — API client.
 * TODO: implement requests against /v2/cms, scoped by the active tenant
 * (x-tenant-slug header, see shared/tenant).
 */

export const getPageBySlug = async (slug: string): Promise<Page | null> => {
  throw new Error(`Not implemented: getPageBySlug(${slug})`);
};
