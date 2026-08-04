import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useQueryClient } from "@tanstack/react-query";
import { createPost, postsKeys } from "@/features/posts/api";
import type { CreatePostInput } from "@/features/posts/contracts/posts.contract";

/** Create a new post. Invalidates the posts list on success. */
export function useCreatePost(options?: {
  onValidationError?: (fields: Record<string, string[]>) => void;
}) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onValidationError: options?.onValidationError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
}
