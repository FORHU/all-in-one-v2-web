import { ApiError } from "@/shared/errors/api-error";
import { env } from "@/shared/lib/env";
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  clearToken,
} from "@/shared/lib/token";

function classify(
  status: number,
):
  | "AUTH"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "SERVER"
  | "NETWORK"
  | "UNKNOWN" {
  if (status === 401) return "AUTH";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 422) return "VALIDATION";
  if (status >= 500) return "SERVER";
  return "UNKNOWN";
}

// The access token lives 15 minutes (see the API's JWT_EXPIRY) — sessions
// otherwise "expire" mid-use, which is what dedupes this: a page that fires
// several authenticated requests at once must trigger exactly one refresh
// call, not one per request (the refresh token is single-use server-side —
// see auth.service.ts — so a second concurrent call would just fail).
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/v2/auth/refresh-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      },
    )
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json().catch(() => null);
        if (!data?.accessToken || !data?.refreshToken) return null;
        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        return data.accessToken as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function fetcher<T>(
  url: string,
  options?: RequestInit,
  _retriedAfterRefresh = false,
): Promise<T> {
  try {
    const token = getToken();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      // A 401 on an authenticated request usually just means the access
      // token expired, not that the session is actually gone — try a
      // silent refresh and replay the request once before giving up and
      // surfacing "Session expired" (see AuthListener.tsx).
      if (res.status === 401 && !_retriedAfterRefresh && getRefreshToken()) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          return fetcher<T>(url, options, true);
        }
        clearToken();
      }

      let payload: any = null;

      try {
        payload = await res.json();
      } catch {}

      const category = classify(res.status);

      throw new ApiError(payload?.message || "Request failed", category, {
        status: res.status,
        code: payload?.code,
        details: payload?.details,
      });
    }

    // 204 No Content / empty bodies (e.g. DELETE) have nothing to parse —
    // calling res.json() on them throws. Resolve to undefined instead.
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as T;
    }

    return res.json();
  } catch (err: any) {
    if (err instanceof TypeError) {
      throw new ApiError("Network error", "NETWORK");
    }
    throw err;
  }
}
