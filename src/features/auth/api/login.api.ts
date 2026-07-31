import { fetcher } from "@/shared/lib/http";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string | null;
  role: string;
  avatar: string | null;
  onboardingCompleted: boolean;
}

export interface LoginResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  name?: string;
}

export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  return fetcher<LoginResponse>("/api/v2/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const register = async (
  credentials: RegisterCredentials,
): Promise<LoginResponse> => {
  return fetcher<LoginResponse>("/api/v2/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const logout = async () => {
  return fetcher("/api/v2/auth/logout", {
    method: "POST",
  });
};
