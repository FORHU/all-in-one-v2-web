import Image from "next/image";

// Mirrors next.config.ts's images.remotePatterns — next/image throws
// synchronously (crashing the whole page, not just the image) when a `src`
// host isn't on that list, so any URL from an unvetted source (collection
// data pasted by hand, a future importer, etc.) has to be checked here
// first and routed to the plain-text fallback instead of ever reaching
// next/image. Keep this in sync whenever remotePatterns changes.
const ALLOWED_IMAGE_HOSTS = [
  /^images\.unsplash\.com$/,
  /^([\w-]+\.)*cjdropshipping\.com$/,
];

export function isAllowedImageHost(url: string): boolean {
  try {
    return ALLOWED_IMAGE_HOSTS.some((pattern) =>
      pattern.test(new URL(url).hostname),
    );
  } catch {
    return false;
  }
}

/**
 * Renders a real image via next/image when `imageUrl` is provided and its
 * host is on the next.config.ts allowlist (see isAllowedImageHost above).
 * Falls back to a text placeholder otherwise — either because no image
 * exists yet (most tenant asset pipelines/CDNs still aren't wired up, see
 * tenants/*\/assets — currently empty) or because the URL points somewhere
 * next/image isn't configured to trust. Uses currentColor on the fallback
 * so it inherits whatever ink color the parent section has set, keeping it
 * tenant-agnostic.
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

  if (imageUrl && isAllowedImageHost(imageUrl)) {
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
