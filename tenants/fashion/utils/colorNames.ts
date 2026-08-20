/**
 * Hex -> human label fallback, used by cart/order-success displays
 * (CartContents, OrderSuccessPage) to label a color already stored on a cart
 * line item. Consumers fall back to the raw hex string when a color isn't
 * in this table, so an incomplete mapping degrades gracefully rather than
 * breaking.
 */
export const COLOR_NAMES: Record<string, string> = {
  "#2b2b2b": "Charcoal",
  "#8a7a63": "Taupe",
  "#c9c2b3": "Sand",
  "#111111": "Black",
  "#7c1f2c": "Burgundy",
  "#e7e2d6": "Ivory",
  "#3a4a3f": "Forest Green",
  "#5a5a52": "Olive Grey",
  "#5c3a24": "Brown",
  "#3d4f63": "Slate Blue",
  "#000000": "Black",
  "#FFFFFF": "White",
  "#000080": "Navy Blue",
  "#DC143C": "Crimson Red",
  "#708238": "Olive Green",
};
