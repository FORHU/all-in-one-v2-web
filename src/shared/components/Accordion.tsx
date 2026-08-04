"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Single collapsible section (filter groups, FAQs, etc.). Purely
 * presentational/local state — no tenant coupling.
 */
export function Accordion({
  title,
  defaultOpen = true,
  children,
  className = "",
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-current/10 py-4 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-bold">{title}</span>
        <ChevronDown
          className={`h-4 w-4 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="mt-3.5">{children}</div>}
    </div>
  );
}
