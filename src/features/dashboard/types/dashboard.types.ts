/**
 * Domain types for the dashboard feature — re-exported from the Zod
 * contract, which remains the single source of truth (see
 * contracts/dashboard.contract.ts). Import from here in components/hooks
 * that only need the shape, not the schema.
 */
export type {
  StatCard,
  RevenueDataPoint,
  DashboardStats,
} from "../contracts/dashboard.contract";
