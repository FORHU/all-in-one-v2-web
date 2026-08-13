import { create } from "zustand";

import { Role } from "@/shared/auth/roles";
import {
  getToken,
  setToken as persistToken,
  setRefreshToken as persistRefreshToken,
  clearToken,
} from "@/shared/lib/token";

export type UserIdentity = {
  id: string;
  tenantId?: string;
  email?: string;
  username?: string;
  name?: string | null;
};

type AuthState = {
  token: string | null;
  role: Role;
  user: UserIdentity | null;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  setRole: (role: Role) => void;
  setUser: (user: UserIdentity | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  role: "viewer",
  user: null,
  // `refreshToken` is only ever provided on login (see useLogin.ts) — the
  // silent-refresh path in shared/lib/http.ts writes straight through
  // shared/lib/token.ts instead, since shared/ can't import this store.
  setToken: (token, refreshToken) => {
    if (token) {
      persistToken(token);
      if (refreshToken) persistRefreshToken(refreshToken);
    } else {
      clearToken();
    }
    set({ token });
  },
  setRole: (role) => set({ role }),
  setUser: (user) => set({ user }),
}));
