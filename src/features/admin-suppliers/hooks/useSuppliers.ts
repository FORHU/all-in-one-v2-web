import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getAdminSuppliers } from "../api/suppliers.client";
import { suppliersKeys } from "../api/suppliers.keys";

/**
 * Fetches supplier sync status (CJ Dropshipping, AliExpress, Printful).
 */
export function useSuppliers() {
  return useSafeQuery({
    queryKey: suppliersKeys.list(),
    queryFn: getAdminSuppliers,
  });
}
