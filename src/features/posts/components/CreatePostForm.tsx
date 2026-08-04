"use client";

import { useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { useCreatePost } from "../hooks";
import type { CreatePostInput } from "../contracts/posts.contract";

/**
 * Demonstrates useSafeMutation with:
 * - Optimistic UI via isPending state
 * - onValidationError wiring (ready for react-hook-form setError binding)
 * - Automatic error toast via FAOS error-router on non-validation errors
 */
export function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createPost, isPending } = useCreatePost({
    onValidationError: (fields) => {
      // Map API validation errors to local form state
      // In a real app, wire this to react-hook-form's setError()
      const mapped: Record<string, string> = {};
      Object.entries(fields).forEach(([k, v]) => {
        mapped[k] = v[0] ?? "Invalid";
      });
      setErrors(mapped);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const input: CreatePostInput = { title, content, published: false };
    createPost(input, {
      onSuccess: () => {
        setTitle("");
        setContent("");
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl glass-light border border-white/5 space-y-4"
    >
      <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wider">
        New Post
      </h3>

      {/* Title */}
      <div className="space-y-1">
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          disabled={isPending}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-text-quaternary focus:outline-none focus:border-brand-core/50 transition-colors disabled:opacity-50"
        />
        {errors.title && (
          <p className="text-xs text-red-400 pl-1">{errors.title}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content…"
          rows={3}
          disabled={isPending}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-text-quaternary focus:outline-none focus:border-brand-core/50 transition-colors resize-none disabled:opacity-50"
        />
        {errors.content && (
          <p className="text-xs text-red-400 pl-1">{errors.content}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || !title.trim() || !content.trim()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-core to-brand-vibrant text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <PlusCircle className="w-4 h-4" />
        )}
        {isPending ? "Creating…" : "Create Post"}
      </button>
    </form>
  );
}
