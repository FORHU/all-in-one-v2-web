"use client";

import { Check, Pencil } from "lucide-react";
import { FASHION_DARK_COLORS, fashionFraunces } from "../theme";

/**
 * Fashion — single collapsible step in the checkout accordion flow.
 * Distinct from shared/components/Accordion (which is a plain FAQ-style
 * toggle) — this one tracks step completion/active state and shows a
 * read-only summary once a step is done, matching common checkout UX
 * (Shopify-style "fill step -> collapse -> next step opens").
 *
 * Fixed dark palette (Ink/Bone/Brass) regardless of the site's light/dark
 * toggle — matched exactly to a supplied mockup, same precedent as
 * CartContents.tsx. `isLast` suppresses the connector line/divider after
 * the final step.
 */
export function CheckoutStep({
  stepNumber,
  title,
  isActive,
  isCompleted,
  summary,
  onEdit,
  children,
  isLast = false,
}: {
  stepNumber: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  summary?: React.ReactNode;
  onEdit?: () => void;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  const isEnabled = isActive || isCompleted;

  return (
    <div
      className="relative py-6 first:pt-0 last:pb-0"
      style={{
        borderBottom: isLast
          ? undefined
          : `1px solid ${FASHION_DARK_COLORS.hairline}`,
      }}
    >
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[13px] top-[26px] bottom-[-24px] w-px"
          style={{ backgroundColor: FASHION_DARK_COLORS.hairline }}
        />
      )}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full text-xs font-bold"
            style={{
              backgroundColor: isEnabled
                ? FASHION_DARK_COLORS.brass
                : FASHION_DARK_COLORS.ink2,
              color: isEnabled
                ? FASHION_DARK_COLORS.ink
                : FASHION_DARK_COLORS.boneDim,
              border: isEnabled
                ? "none"
                : `1px solid ${FASHION_DARK_COLORS.hairline}`,
            }}
          >
            {isCompleted ? <Check className="h-3.5 w-3.5" /> : stepNumber}
          </span>
          <span
            className={fashionFraunces.className}
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: isEnabled
                ? FASHION_DARK_COLORS.bone
                : FASHION_DARK_COLORS.boneDim,
            }}
          >
            {title}
          </span>
        </div>
        {isCompleted && !isActive && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-semibold underline"
            style={{ color: FASHION_DARK_COLORS.boneDim }}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        )}
      </div>

      {isActive && <div className="relative mt-4 pl-[38px]">{children}</div>}
      {isCompleted && !isActive && summary && (
        <div
          className="relative mt-2 pl-[38px] text-sm"
          style={{ color: FASHION_DARK_COLORS.boneDim }}
        >
          {summary}
        </div>
      )}
    </div>
  );
}
