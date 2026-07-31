import { create } from "zustand";

import { Role } from "@/shared/auth/roles";
import { getToken, setToken, clearToken } from "@/shared/lib/token";

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
  setToken: (token: string | null) => void;
  setRole: (role: Role) => void;
  setUser: (user: UserIdentity | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  role: "viewer",
  user: null,
  setToken: (token) => {
    if (token) {
      setToken(token);
    } else {
      clearToken();
    }
    set({ token });
  },
  setRole: (role) => set({ role }),
  setUser: (user) => set({ user }),
}));
