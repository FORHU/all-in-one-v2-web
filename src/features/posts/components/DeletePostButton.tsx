"use client";

import { Trash2 } from "lucide-react";
import { useDeletePost } from "../hooks";

interface DeletePostButtonProps {
  postId: string;
}

/**
 * Demonstrates useSafeMutation.
 * Errors are automatically routed through the FAOS error-router (toast + telemetry).
 */
export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const { mutate: deletePost, isPending } = useDeletePost();

  return (
    <button
      onClick={() => deletePost(postId)}
      disabled={isPending}
      aria-label="Delete post"
      className="p-2 rounded-xl text-text-quaternary hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
    >
      <Trash2 className={`w-4 h-4 ${isPending ? "animate-pulse" : ""}`} />
    </button>
  );
}
