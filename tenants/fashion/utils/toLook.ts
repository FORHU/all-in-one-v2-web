import type {
  Collection,
  CollectionItem,
} from "@/features/storefront/contracts/collections.contract";
import type { Look, LookCategory, LookItem } from "../data/looks";
import { LOOK_CATEGORIES } from "../data/looks";

/** Slots that read as the "foundation" of an outfit vs. an outer/finishing layer. */
const BASE_SLOTS = new Set(["UpperGarment", "LowerGarment", "Dress"]);

function toTag(slot: string | null): LookItem["tag"] {
  return slot && BASE_SLOTS.has(slot) ? "BASE" : "OVER";
}

function toCategory(metadata: Collection["metadata"]): LookCategory {
  const style = metadata?.style;
  if (
    typeof style === "string" &&
    (LOOK_CATEGORIES as string[]).includes(style)
  ) {
    return style as LookCategory;
  }
  // CatalogCollection.metadata doesn't always carry a `style` (some seeded
  // rows use `colorTheme` instead) — default rather than drop the look.
  return "Casual";
}

function toLookItem(item: CollectionItem): LookItem {
  return {
    id: item.id,
    slug: item.product.slug,
    tag: toTag(item.slot),
    name: item.product.title,
    brand: item.product.brand ?? "",
    size: item.productVariant?.title ?? "",
    price: item.product.price ?? 0,
    imageLabel: item.product.title,
    imageUrl: item.product.thumbnailUrl,
  };
}

/**
 * Maps a CatalogCollection (from GET /v2/collections) to the Look shape
 * TrendingLookbook renders. The collection itself rarely has its own
 * imageUrl seeded, so this falls back to the first item's product image.
 */
export function toLook(collection: Collection): Look {
  return {
    id: collection.id,
    name: collection.title,
    category: toCategory(collection.metadata),
    type: collection.type,
    imageLabel: collection.title,
    imageUrl:
      collection.imageUrl ?? collection.items[0]?.product.thumbnailUrl ?? null,
    items: collection.items.map(toLookItem),
  };
}
