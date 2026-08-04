/**
 * Domain types for the posts feature — re-exported from the Zod contract,
 * which remains the single source of truth (see
 * contracts/posts.contract.ts).
 */
export type {
  Post,
  PostsResponse,
  CreatePostInput,
} from "../contracts/posts.contract";
