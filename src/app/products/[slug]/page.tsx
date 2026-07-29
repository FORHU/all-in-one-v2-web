/**
 * Route entry point only — no business logic here.
 * TODO: resolve the active tenant and render the storefront's product detail
 * page for `slug`, composed from `features/storefront` hooks and the
 * tenant's presentation layer.
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  return null;
}
