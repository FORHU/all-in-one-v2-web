import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes third-party HTML before it's rendered via
 * dangerouslySetInnerHTML — e.g. CJ Dropshipping product descriptions,
 * which arrive as raw HTML (including embedded <img> size-chart images)
 * straight from the supplier, not authored by us. isomorphic-dompurify runs
 * against jsdom on the server and the native DOM in the browser, so this is
 * safe to call during SSR as well as on the client.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}
