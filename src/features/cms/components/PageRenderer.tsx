import type { Page } from "../contracts/cms.contract";

/**
 * Renders a CMS Page's sections (HERO, FEATURE_GRID, TESTIMONIALS, etc.).
 * Shared across all 5 tenants — section *content* differs per tenant via
 * data, not via forked components.
 * TODO: implement a section-type -> component map.
 */
export function PageRenderer({ page }: { page: Page }) {
  void page;
  return null;
}
