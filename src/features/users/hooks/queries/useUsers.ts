import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getUsers, usersKeys } from "@/features/users/api";

export function useUsers() {
  return useSafeQuery({
    queryKey: usersKeys.lists(),
    queryFn: getUsers,
  });
}
