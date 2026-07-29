import { z } from "zod";

/**
 * FAOS v5 — CMS Contracts
 * Authoritative shape for CMS API responses.
 * TODO: align with all-in-one-v2-api's Page/PageSection models.
 */

export const PageSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  content: z.record(z.string(), z.unknown()),
  position: z.number(),
});

export const PageSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  slug: z.string(),
  title: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  sections: z.array(PageSectionSchema),
});

export type Page = z.infer<typeof PageSchema>;
export type PageSection = z.infer<typeof PageSectionSchema>;
