import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { sanitizeHtml } from "@/shared/lib/sanitizeHtml";
import { parseSupplierDescription } from "../utils/parseSupplierDescription";
import type { getFashionColors } from "../theme";

type FashionColors = ReturnType<typeof getFashionColors>;
type TabId = "details" | "sizeGuide" | "care";

/** How many spec cards show before the "Show all" toggle appears — enough for one compact 2-column block. */
const COLLAPSED_SPEC_LIMIT = 4;

/** Supplier data sometimes repeats a label (CJ's raw text has two separate "Style:" lines, for example) — one card per distinct label reads cleaner than duplicates. */
function mergeDuplicateSpecs(
  specs: { label: string; value: string }[],
): { label: string; value: string }[] {
  const merged = new Map<string, { label: string; value: string }>();
  for (const spec of specs) {
    const key = spec.label.toLowerCase();
    const existing = merged.get(key);
    if (existing) {
      existing.value = `${existing.value}, ${spec.value}`;
    } else {
      merged.set(key, { ...spec });
    }
  }
  return Array.from(merged.values());
}

/**
 * Renders a supplier's raw HTML product description (CJ Dropshipping, etc.)
 * as a tabbed spec sheet — Details / Size Guide / Care — instead of dumping
 * the sanitized HTML blob straight into the page, or stacking every section
 * one after another. Only tabs with real content are shown; if just one
 * section has content, its content renders directly with no tab bar at all
 * (a single-tab switcher is pointless chrome). `parseSupplierDescription` is
 * client-only (needs DOMParser), so `hasMounted` gates this: SSR and the
 * first client render fall back to the plain sanitized-HTML render (same
 * markup on both sides, so hydration doesn't mismatch), and this upgrades
 * in place right after mount. Falls back to the same plain render if
 * parsing finds no real structure — some supplier descriptions are already
 * just prose.
 */
export function ProductSpecSheet({
  description,
  hasMounted,
  colors,
}: {
  description: string;
  hasMounted: boolean;
  colors: FashionColors;
}) {
  const rawParsed = hasMounted
    ? parseSupplierDescription(description)
    : { specs: [], notes: [], images: [] };

  // Color and Size already have their own dedicated, interactive pickers
  // elsewhere on the page — repeating them as flat read-only spec rows is
  // redundant, and often actively misleading for Color specifically: CJ
  // frequently uses the literal value "Picture color" (meaning "see the
  // photo," not an actual color name) rather than a real color.
  const REDUNDANT_SPEC_LABELS = new Set(["color", "colour", "size"]);
  const parsed = {
    ...rawParsed,
    specs: mergeDuplicateSpecs(
      rawParsed.specs.filter(
        (spec) => !REDUNDANT_SPEC_LABELS.has(spec.label.toLowerCase()),
      ),
    ),
  };

  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const visibleSpecs = showAllSpecs
    ? parsed.specs
    : parsed.specs.slice(0, COLLAPSED_SPEC_LIMIT);
  const hiddenSpecCount = parsed.specs.length - visibleSpecs.length;

  const hasStructure = parsed.specs.length > 0 || parsed.images.length > 0;
  if (!hasStructure) {
    return (
      <div
        className="mt-5 text-sm leading-relaxed [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_p]:mb-2.5 [&_p]:last:mb-0"
        style={{ color: colors.boneDim }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
      />
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    ...(parsed.specs.length > 0
      ? [{ id: "details" as const, label: "Details" }]
      : []),
    ...(parsed.images.length > 0
      ? [{ id: "sizeGuide" as const, label: "Size Guide" }]
      : []),
    ...(parsed.notes.length > 0
      ? [{ id: "care" as const, label: "Care" }]
      : []),
  ];

  return (
    <TabbedContent tabs={tabs} colors={colors}>
      {(activeTab) => (
        <>
          {activeTab === "details" && (
            <div>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8"
                style={{ borderColor: colors.hairline }}
              >
                {visibleSpecs.map((spec, i) => (
                  <div
                    key={`${spec.label}-${i}`}
                    className="border-b py-2.5"
                    style={{ borderColor: colors.hairline }}
                  >
                    <div
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: colors.boneDim }}
                    >
                      {spec.label}
                    </div>
                    <div
                      className="mt-0.5 text-sm"
                      style={{ color: colors.bone }}
                    >
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
              {(hiddenSpecCount > 0 ||
                (showAllSpecs &&
                  parsed.specs.length > COLLAPSED_SPEC_LIMIT)) && (
                <button
                  type="button"
                  onClick={() => setShowAllSpecs((v) => !v)}
                  className="mt-3 flex items-center gap-1 text-xs font-semibold underline"
                  style={{ color: colors.boneDim }}
                >
                  {showAllSpecs
                    ? "Show less"
                    : `Show ${hiddenSpecCount} more detail${hiddenSpecCount === 1 ? "" : "s"}`}
                  {showAllSpecs ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>
          )}

          {activeTab === "sizeGuide" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {parsed.images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary supplier host, not worth widening next.config's image allowlist for reference/table images
                <img
                  key={`${src}-${i}`}
                  src={src}
                  alt="Size guide"
                  loading="lazy"
                  className="w-full rounded-lg border object-contain"
                  style={{
                    borderColor: colors.hairline,
                    backgroundColor: "#fff",
                  }}
                />
              ))}
            </div>
          )}

          {activeTab === "care" && (
            <div className="flex flex-col gap-1.5">
              {parsed.notes.map((note, i) => (
                <p
                  key={i}
                  className="text-xs leading-relaxed"
                  style={{ color: colors.boneDim }}
                >
                  {note}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </TabbedContent>
  );
}

/**
 * Shared tab-switcher chrome. Skips the tab bar entirely when there's only
 * one tab — nothing to switch between — and renders that tab's content
 * directly instead.
 */
function TabbedContent({
  tabs,
  colors,
  children,
}: {
  tabs: { id: TabId; label: string }[];
  colors: FashionColors;
  children: (activeTab: TabId) => React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<TabId>(tabs[0]?.id ?? "details");
  const resolvedTab = tabs.some((t) => t.id === activeTab)
    ? activeTab
    : (tabs[0]?.id ?? "details");

  if (tabs.length === 0) return null;

  return (
    <div className="mt-5">
      {tabs.length > 1 && (
        <div
          role="tablist"
          className="mb-2.5 flex gap-5 border-b"
          style={{ borderColor: colors.hairline }}
        >
          {tabs.map((tab) => {
            const active = tab.id === resolvedTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className="-mb-px border-b-2 pb-2.5 text-xs font-bold uppercase transition-colors"
                style={{
                  letterSpacing: "0.15em",
                  borderColor: active ? colors.brass : "transparent",
                  color: active ? colors.bone : colors.boneDim,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
      {tabs.length === 1 && (
        <div
          className="mb-2.5 text-xs font-bold uppercase"
          style={{ color: colors.brass, letterSpacing: "0.2em" }}
        >
          {tabs[0].label}
        </div>
      )}
      {children(resolvedTab)}
    </div>
  );
}
