import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useQueryClient } from "@tanstack/react-query";
import { deletePost, postsKeys } from "@/features/posts/api";

/** Delete a post by ID. Invalidates the posts list on success. */
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
}
