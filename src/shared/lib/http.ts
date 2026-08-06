import { ApiError } from "@/shared/errors/api-error";
import { env } from "@/shared/lib/env";
import { getToken } from "@/shared/lib/token";
import { getTenantSlug } from "@/shared/lib/tenant";

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

export async function fetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const token = getToken();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": getTenantSlug(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
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
