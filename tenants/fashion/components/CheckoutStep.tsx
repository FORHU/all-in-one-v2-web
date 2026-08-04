"use client";

import { Check, Pencil } from "lucide-react";

/**
 * Fashion — single collapsible step in the checkout accordion flow.
 * Distinct from shared/components/Accordion (which is a plain FAQ-style
 * toggle) — this one tracks step completion/active state and shows a
 * read-only summary once a step is done, matching common checkout UX
 * (Shopify-style "fill step -> collapse -> next step opens").
 */
export function CheckoutStep({
  stepNumber,
  title,
  isActive,
  isCompleted,
  summary,
  onEdit,
  children,
}: {
  stepNumber: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  summary?: React.ReactNode;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  const isEnabled = isActive || isCompleted;

  return (
    <div className="border-b border-current/10 py-6 first:pt-0 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold"
            style={{
              backgroundColor: isEnabled
                ? "var(--brand-primary)"
                : "transparent",
              color: isEnabled
                ? "var(--brand-secondary)"
                : "var(--brand-primary)",
              border: isEnabled ? "none" : "1px solid currentColor",
              opacity: isEnabled ? 1 : 0.35,
            }}
          >
            {isCompleted ? <Check className="h-3.5 w-3.5" /> : stepNumber}
          </span>
          <span
            className="text-base font-bold"
            style={{ opacity: isEnabled ? 1 : 0.35 }}
          >
            {title}
          </span>
        </div>
        {isCompleted && !isActive && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-semibold underline opacity-70"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        )}
      </div>

      {isActive && <div className="mt-4 pl-10">{children}</div>}
      {isCompleted && !isActive && summary && (
        <div className="mt-2 pl-10 text-sm opacity-70">{summary}</div>
      )}
    </div>
  );
}
