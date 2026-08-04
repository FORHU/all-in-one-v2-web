import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useUsers } from "@/features/users/hooks";
import * as usersClient from "@/features/users/api/users.client";

// ── Wrapper ──────────────────────────────────────────────────────────────────
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests for speed
        gcTime: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const MOCK_USERS = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" },
];

describe("useUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns users data on successful fetch", async () => {
    vi.spyOn(usersClient, "getUsers").mockResolvedValue(MOCK_USERS);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_USERS);
    expect(result.current.error).toBeNull();
  });

  it("returns error state when fetch fails", async () => {
    const mockError = new Error("Failed to fetch users");
    vi.spyOn(usersClient, "getUsers").mockRejectedValue(mockError);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });

  it("calls getUsers exactly once on mount", async () => {
    const spy = vi.spyOn(usersClient, "getUsers").mockResolvedValue(MOCK_USERS);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
