import { useSafeQuery } from "@/shared/query/useSafeQuery";
import {
  getAdminSuppliers,
  suppliersKeys,
} from "@/features/admin-suppliers/api";

/**
 * Fetches supplier sync status (CJ Dropshipping, AliExpress, Printful).
 */
export function useSuppliers() {
  return useSafeQuery({
    queryKey: suppliersKeys.list(),
    queryFn: getAdminSuppliers,
  });
}
