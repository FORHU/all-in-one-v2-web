import { fetcher } from "@/shared/lib/http";
import {
  LoginResponseSchema,
  type LoginCredentials,
  type LoginResponse,
  type RegisterCredentials,
} from "../contracts/auth.contract";

export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  const raw = await fetcher<unknown>("/api/v2/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return LoginResponseSchema.parse(raw);
};

export const register = async (
  credentials: RegisterCredentials,
): Promise<LoginResponse> => {
  const raw = await fetcher<unknown>("/api/v2/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return LoginResponseSchema.parse(raw);
};

export const logout = async () => {
  return fetcher("/api/v2/auth/logout", {
    method: "POST",
  });
};
