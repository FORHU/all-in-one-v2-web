"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, X } from "lucide-react";
import { useProducts } from "@/features/storefront/hooks/queries/useProducts";
import { useDebouncedValue } from "@/shared/hooks";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import type { Product } from "@/features/storefront/contracts/products.contract";
import { electronicsConfig } from "../tenant.config";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

/** Wait this long after the last keystroke before querying the API. */
const SEARCH_DEBOUNCE_MS = 300;
/** Shorter queries match too broadly to be useful as suggestions. */
const MIN_QUERY_LENGTH = 2;
const SUGGESTION_LIMIT = 6;

function priceOf(p: Product): number {
  return p.salePrice ?? p.price ?? 0;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Bolds each query word inside a suggestion's title. */
function Highlighted({ text, query }: { text: string; query: string }) {
  const terms = query.split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (terms.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${terms.join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="bg-transparent font-bold"
            style={{ color: COLORS.ink }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/**
 * DigitFriend — header search with live suggestions.
 *
 * Typing is debounced (useDebouncedValue, SEARCH_DEBOUNCE_MS) so the API is
 * queried once the shopper pauses, not on every keystroke; each settled
 * query hits GET /v2/products?q= (title/brand, every word must match) for
 * the top SUGGESTION_LIMIT matches. While the typed text is ahead of the
 * debounced query — or a request is in flight — a spinner shows instead of
 * stale "no results".
 *
 * Keyboard: ↑/↓ move through suggestions, Enter opens the highlighted one
 * (or, with none highlighted, the full results at /shop?q=), Escape closes.
 * On /shop?q=… the box is pre-filled with that query.
 */
export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listboxId = useId();
  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const urlQuery = pathname === "/shop" ? (searchParams.get("q") ?? "") : "";
  const [query, setQuery] = useState(urlQuery);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  // Follow the URL (e.g. back/forward between searches, or leaving /shop).
  useEffect(() => setQuery(urlQuery), [urlQuery]);

  const trimmed = query.trim();
  const debouncedQuery = useDebouncedValue(trimmed, SEARCH_DEBOUNCE_MS);
  const canSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const { data, isFetching } = useProducts(
    electronicsConfig.slug,
    { q: debouncedQuery, limit: SUGGESTION_LIMIT, sort: "newest" },
    canSearch,
  );
  const suggestions = canSearch ? (data?.items ?? []) : [];
  const total = canSearch ? (data?.total ?? 0) : 0;
  const isSettling = trimmed !== debouncedQuery || isFetching;
  const showPanel = open && trimmed.length >= MIN_QUERY_LENGTH;

  // New results → nothing highlighted.
  useEffect(() => setHighlighted(-1), [debouncedQuery]);

  // Close when clicking anywhere outside the search box + panel.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const goToResults = () => {
    if (!trimmed) return;
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  const goToProduct = (product: Product) => {
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/products/${product.slug}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (highlighted >= 0 && suggestions[highlighted]) {
      goToProduct(suggestions[highlighted]);
    } else {
      goToResults();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!showPanel || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  };

  return (
    <form
      ref={containerRef}
      role="search"
      onSubmit={handleSubmit}
      className="relative min-w-0 flex-1"
      style={{ flexBasis: "260px" }}
    >
      <div
        className="flex h-11 items-center gap-2.5 rounded-xl px-3.5"
        style={{
          backgroundColor: COLORS.headerPanelBg,
          border: `1px solid ${showPanel ? COLORS.accent : COLORS.headerPanelBorder}`,
        }}
      >
        {isSettling && showPanel ? (
          <Loader2
            size={18}
            className="flex-none animate-spin"
            color="#9aa0ab"
            aria-hidden="true"
          />
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9aa0ab"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            className="flex-none"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        )}
        <label htmlFor="df-search" className="sr-only">
          Search products
        </label>
        <input
          ref={inputRef}
          id="df-search"
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            highlighted >= 0 ? `${listboxId}-${highlighted}` : undefined
          }
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search speakers, keyboards, webcams…"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#9aa0ab] [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex h-6 w-6 flex-none items-center justify-center rounded-full"
            style={{ backgroundColor: COLORS.headerPanelBorder }}
          >
            <X size={14} color="#ffffff" />
          </button>
        )}
      </div>

      {showPanel && (
        <div
          className="absolute inset-x-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-2xl shadow-[0_16px_40px_rgba(15,17,21,0.18)]"
          style={{
            backgroundColor: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.ink,
            colorScheme: "light",
          }}
        >
          {suggestions.length > 0 ? (
            <>
              <div
                className="px-4 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wide"
                style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
              >
                Products
              </div>
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Search suggestions"
                className="m-0 list-none p-1.5"
                style={{ opacity: isSettling ? 0.6 : 1 }}
              >
                {suggestions.map((p, i) => {
                  const active = i === highlighted;
                  return (
                    <li
                      key={p.id}
                      id={`${listboxId}-${i}`}
                      role="option"
                      aria-selected={active}
                    >
                      <Link
                        href={`/products/${p.slug}`}
                        onClick={() => setOpen(false)}
                        onMouseEnter={() => setHighlighted(i)}
                        className="flex items-center gap-3 rounded-xl px-2.5 py-2"
                        style={{
                          backgroundColor: active ? COLORS.bg : "transparent",
                        }}
                      >
                        <ImagePlaceholder
                          imageUrl={p.thumbnailUrl}
                          label={p.title}
                          aspect="1/1"
                          className="h-11 w-11 flex-none overflow-hidden rounded-lg text-[9px]"
                        />
                        <span
                          className="min-w-0 flex-1 truncate text-sm"
                          style={{ color: COLORS.muted }}
                        >
                          <Highlighted text={p.title} query={debouncedQuery} />
                        </span>
                        <span className="flex-none text-sm font-bold">
                          ${priceOf(p).toFixed(2)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <button
                type="submit"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold"
                style={{
                  borderTop: `1px solid ${COLORS.border}`,
                  backgroundColor: COLORS.bg,
                }}
              >
                <span className="min-w-0 truncate">
                  See all {total} result{total === 1 ? "" : "s"} for “{trimmed}”
                </span>
                <ArrowRight size={16} className="flex-none" />
              </button>
            </>
          ) : (
            <div
              className="px-4 py-5 text-center text-sm"
              style={{ color: COLORS.muted }}
            >
              {isSettling ? (
                "Searching…"
              ) : (
                <>
                  No products match{" "}
                  <span className="font-semibold" style={{ color: COLORS.ink }}>
                    “{trimmed}”
                  </span>
                  . Try a different word.
                </>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
