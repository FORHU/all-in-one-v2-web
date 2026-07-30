/**
 * Stand-in for real photography until tenant asset pipelines / a CDN are
 * wired up (see tenants/*\/assets — currently empty). Swap for next/image
 * once next.config.ts has images.remotePatterns configured and real assets
 * exist. Uses currentColor so it inherits whatever ink color the parent
 * section has set, keeping it tenant-agnostic.
 */
export function ImagePlaceholder({
  label,
  aspect = "1/1",
  shape = "rounded",
  className = "",
}: {
  label: string;
  aspect?: string;
  shape?: "rounded" | "circle";
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex items-center justify-center overflow-hidden border border-dashed border-current/15 bg-current/[0.04] text-center text-[11px] font-medium leading-snug text-current/40 ${
        shape === "circle" ? "rounded-full" : "rounded-2xl"
      } ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <span className="px-3">{label}</span>
    </div>
  );
}
