export interface LookItem {
  id: string;
  tag: "BASE" | "OVER";
  name: string;
  brand: string;
  size: string;
  price: number;
  imageLabel: string;
}

export interface Look {
  id: string;
  name: string;
  imageLabel: string;
  items: LookItem[];
}

/**
 * Fashion — "Get the Look" curated outfit bundles, shown on the homepage
 * hero (components/HeroBanner.tsx). Static editorial content, same as the
 * rest of the homepage — no backend concept of a "look"/outfit bundle
 * exists (Prisma has no such model), so this isn't a placeholder for a
 * future API in the way products/categories are.
 */
export const fashionLooks: Look[] = [
  {
    id: "off-duty-set",
    name: "The Off-Duty Set",
    imageLabel: "Look: The Off-Duty Set",
    items: [
      {
        id: "taupe-stretch-shirt",
        tag: "BASE",
        name: "Taupe Stretch Shirt",
        brand: "ADDICTSTYLE",
        size: "M",
        price: 120,
        imageLabel: "Item: Taupe Stretch Shirt",
      },
      {
        id: "white-linen-trouser",
        tag: "BASE",
        name: "White Linen Trouser",
        brand: "ADDICTSTYLE",
        size: "32",
        price: 160,
        imageLabel: "Item: White Linen Trouser",
      },
      {
        id: "white-tonal-sneaker",
        tag: "OVER",
        name: "White Tonal Sneaker",
        brand: "STUDIO NUE",
        size: "9",
        price: 210,
        imageLabel: "Item: White Tonal Sneaker",
      },
    ],
  },
  {
    id: "tailored-edit",
    name: "The Tailored Edit",
    imageLabel: "Look: The Tailored Edit",
    items: [
      {
        id: "charcoal-wool-blazer",
        tag: "OVER",
        name: "Charcoal Wool Blazer",
        brand: "ADDICTSTYLE",
        size: "M",
        price: 240,
        imageLabel: "Item: Charcoal Wool Blazer",
      },
      {
        id: "ivory-silk-shirt",
        tag: "BASE",
        name: "Ivory Silk Shirt",
        brand: "STUDIO NUE",
        size: "S",
        price: 110,
        imageLabel: "Item: Ivory Silk Shirt",
      },
      {
        id: "straight-leg-trouser",
        tag: "BASE",
        name: "Straight Leg Trouser",
        brand: "ADDICTSTYLE",
        size: "30",
        price: 150,
        imageLabel: "Item: Straight Leg Trouser",
      },
    ],
  },
  {
    id: "weekend-layers",
    name: "Weekend Layers",
    imageLabel: "Look: Weekend Layers",
    items: [
      {
        id: "cropped-denim-jacket-look",
        tag: "OVER",
        name: "Cropped Denim Jacket",
        brand: "STUDIO NUE",
        size: "M",
        price: 156,
        imageLabel: "Item: Cropped Denim Jacket",
      },
      {
        id: "ribbed-knit-tank",
        tag: "BASE",
        name: "Ribbed Knit Tank",
        brand: "ADDICTSTYLE",
        size: "S",
        price: 68,
        imageLabel: "Item: Ribbed Knit Tank",
      },
      {
        id: "relaxed-chino",
        tag: "BASE",
        name: "Relaxed Chino",
        brand: "ADDICTSTYLE",
        size: "32",
        price: 120,
        imageLabel: "Item: Relaxed Chino",
      },
    ],
  },
];
