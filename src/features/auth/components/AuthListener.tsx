"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth.store";
import { useCurrentUser } from "../hooks/queries/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";

export function AuthListener() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  // Only the token survives a page reload (see shared/lib/token.ts) — `user`
  // is otherwise only ever set transiently right after a fresh
  // login/register, so any fresh page load with an existing session left it
  // null. Rehydrate it from GET /v2/users/me so pages/AccountPage.tsx and
  // usePermissions.ts see the real signed-in user instead of nothing.
  const { data: currentUser } = useCurrentUser(!!token && !user);

  useEffect(() => {
    if (currentUser) {
      setUser({
        id: currentUser.id,
        email: currentUser.email,
        username: currentUser.username,
        name: currentUser.name,
      });
    }
  }, [currentUser, setUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      // Clear token and query cache on 401
      setToken(null);
      setUser(null);
      queryClient.clear();
      router.push("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [router, setToken, setUser, queryClient]);

  return null;
}
