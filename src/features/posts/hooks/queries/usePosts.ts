import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getPosts, postsKeys } from "@/features/posts/api";

/** Fetch all posts. */
export function usePosts() {
  return useSafeQuery({
    queryKey: postsKeys.lists(),
    queryFn: getPosts,
  });
}
