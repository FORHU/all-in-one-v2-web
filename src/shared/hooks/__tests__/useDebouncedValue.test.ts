import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 300));
    expect(result.current).toBe("a");
  });

  it("only updates once the value has been stable for the delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("ab");
  });

  it("restarts the timer on every change, so a burst yields one update", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "k" } },
    );

    for (const value of ["ke", "key", "keyb"]) {
      rerender({ value });
      act(() => vi.advanceTimersByTime(200));
      expect(result.current).toBe("k");
    }

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("keyb");
  });
});
