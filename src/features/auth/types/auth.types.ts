/**
 * Domain types for the auth feature — re-exported from the Zod contract,
 * which remains the single source of truth (see
 * contracts/auth.contract.ts).
 */
export type {
  LoginCredentials,
  RegisterCredentials,
  AuthUser,
  LoginResponse,
} from "../contracts/auth.contract";
