import { sanitizeHtml } from "@/shared/lib/sanitizeHtml";

export interface ParsedDescription {
  /** "Key: value" lines pulled out of the supplier's freeform HTML, e.g. Pattern/Color/Size/Fabric. */
  specs: { label: string; value: string }[];
  /** Leftover freeform sentences that aren't spec lines (care/sizing notes, etc.) — shown as small print. */
  notes: string[];
  /** Every <img> the description embeds (size charts, packaging photos), `data-src` preferred over `src` since suppliers often lazy-load a low-res placeholder into `src`. */
  images: string[];
}

// Section labels the supplier uses as bare headers ("Product Image:", "Note:")
// rather than real key/value spec lines — excluded so they don't show up as
// a spec row reading "Product Image: " or get glued onto the sentence that follows.
const SECTION_HEADERS = new Set([
  "product information",
  "product image",
  "note",
]);

function isSpecLine(text: string): boolean {
  const idx = text.indexOf(":");
  if (idx < 2 || idx > 40) return false;
  const label = text.slice(0, idx).trim();
  const value = text.slice(idx + 1).trim();
  if (!value || SECTION_HEADERS.has(label.toLowerCase())) return false;
  return true;
}

/**
 * Best-effort structure extraction from a supplier's raw HTML product
 * description (CJ Dropshipping, etc.) — these arrive as an unstructured
 * blob of "Key: value" lines, a couple of section headers, and embedded
 * <img> tags (size charts, packaging photos), not real markup with any
 * semantic tagging. Runs client-side only (needs DOMParser) — callers must
 * keep a plain sanitizeHtml() + dangerouslySetInnerHTML fallback for SSR
 * and for descriptions that don't match this shape at all.
 */
export function parseSupplierDescription(html: string): ParsedDescription {
  if (typeof window === "undefined")
    return { specs: [], notes: [], images: [] };

  const doc = new DOMParser().parseFromString(sanitizeHtml(html), "text/html");

  const images = Array.from(doc.querySelectorAll("img"))
    .map((img) => img.getAttribute("data-src") || img.getAttribute("src") || "")
    .filter(Boolean);

  // Text content, split into lines on <br>/<p>/<div> boundaries — the
  // supplier's only real structural signal, since everything else is
  // <b>/plain text run together.
  const lines: string[] = [];
  let current = "";
  const flushLine = () => {
    const trimmed = current.replace(/\s+/g, " ").trim();
    if (trimmed) lines.push(trimmed);
    current = "";
  };
  const walk = (node: ChildNode) => {
    if (node.nodeType === Node.TEXT_NODE) {
      current += node.textContent ?? "";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (tag === "br") {
      flushLine();
    } else if (tag === "img") {
      // Handled separately above — not part of the text flow.
    } else {
      el.childNodes.forEach(walk);
      if (tag === "p" || tag === "div") flushLine();
    }
  };
  doc.body.childNodes.forEach(walk);
  flushLine();

  const specs: ParsedDescription["specs"] = [];
  const notes: string[] = [];
  for (const line of lines) {
    if (SECTION_HEADERS.has(line.toLowerCase().replace(/:$/, ""))) continue;
    if (isSpecLine(line)) {
      const idx = line.indexOf(":");
      specs.push({
        label: line.slice(0, idx).trim(),
        value: line.slice(idx + 1).trim(),
      });
    } else {
      notes.push(line);
    }
  }

  return { specs, notes, images };
}
