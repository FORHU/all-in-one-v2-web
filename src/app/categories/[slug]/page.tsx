/**
 * Route entry point only — no business logic here.
 * TODO: resolve the active tenant and render products for category `slug`,
 * composed from `features/storefront` hooks and the tenant's presentation
 * layer.
 */
export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  return null;
}
