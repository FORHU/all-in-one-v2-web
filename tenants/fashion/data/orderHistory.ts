export type OrderStatus = "Delivered" | "In Transit" | "Processing";

export interface DemoOrder {
  orderNumber: string;
  placedAt: string;
  status: OrderStatus;
  itemSummary: string;
  itemCount: number;
  total: number;
}

/**
 * Fashion — order-history demo data.
 * There is no real order-history endpoint (no GET /v2/orders list route is
 * wired up on the frontend), so these are fabricated past orders purely to
 * give the account dashboard's Order History tab something to show besides
 * the single real order captured by useLastOrderStore right after
 * checkout. Clearly not real purchases — see pages/AccountPage.tsx, which
 * prepends the real last order (if any) ahead of this list.
 */
export const demoOrderHistory: DemoOrder[] = [
  {
    orderNumber: "ADD-88213",
    placedAt: "2026-06-14T10:00:00.000Z",
    status: "Delivered",
    itemSummary: "Wool Overcoat + 1 more",
    itemCount: 2,
    total: 416.0,
  },
  {
    orderNumber: "ADD-91027",
    placedAt: "2026-07-02T10:00:00.000Z",
    status: "In Transit",
    itemSummary: "Cashmere Knit",
    itemCount: 1,
    total: 214.0,
  },
];
