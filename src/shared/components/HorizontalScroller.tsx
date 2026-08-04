"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Horizontally scrollable row with arrow controls (e.g. best-seller rails).
 * Purely presentational — content is passed as children.
 */
export function HorizontalScroller({
  children,
  scrollByAmount = 300,
  className = "",
}: {
  children: React.ReactNode;
  scrollByAmount?: number;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({
      left: direction * scrollByAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={className}>
      <div className="mb-4 flex justify-end gap-2.5">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-current/15"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-current/15"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollBehavior: "smooth" }}
      >
        {children}
      </div>
    </div>
  );
}
