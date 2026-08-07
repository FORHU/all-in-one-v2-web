import Image from "next/image";

/**
 * Renders a real image via next/image when `imageUrl` is provided (requires
 * the host to be listed in next.config.ts's images.remotePatterns). Falls
 * back to a text placeholder otherwise — most tenant asset pipelines/CDNs
 * still aren't wired up (see tenants/*\/assets — currently empty), so this
 * stays the default for anything without a real backing image yet. Uses
 * currentColor on the fallback so it inherits whatever ink color the parent
 * section has set, keeping it tenant-agnostic.
 */
export function ImagePlaceholder({
  label,
  imageUrl,
  aspect = "1/1",
  shape = "rounded",
  className = "",
}: {
  label: string;
  imageUrl?: string | null;
  aspect?: string;
  shape?: "rounded" | "circle";
  className?: string;
}) {
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  if (imageUrl) {
    return (
      <div
        className={`relative overflow-hidden ${shapeClass} ${className}`}
        style={{ aspectRatio: aspect }}
      >
        <Image
          src={imageUrl}
          alt={label}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={`flex items-center justify-center overflow-hidden border border-dashed border-current/15 bg-current/[0.04] text-center text-[11px] font-medium leading-snug text-current/40 ${shapeClass} ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <span className="px-3">{label}</span>
    </div>
  );
}
