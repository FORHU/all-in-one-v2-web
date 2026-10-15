"use client";

import { DIGITFRIEND_COLORS as COLORS } from "../theme";

/**
 * DigitFriend — newsletter signup, matching the reference exactly. No real
 * submit behavior: there's no newsletter backend anywhere in this
 * codebase, so this is a decorative, non-deceptive form (it doesn't show a
 * fake "Subscribed!" success state) — same precedent as fashion's header
 * search box.
 */
export function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div
        className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] p-9"
        style={{
          backgroundColor: COLORS.ink,
          color: "#ffffff",
          colorScheme: "dark",
        }}
      >
        <div className="flex min-w-[360px] flex-1 flex-col gap-2">
          <h2
            className="m-0 text-[28px] font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Get first dibs on new drops.
          </h2>
          <p className="m-0 text-base" style={{ color: "#b8bcc6" }}>
            New gear and restocks in your inbox. No spam, unsubscribe anytime.
          </p>
        </div>
        <form
          className="flex min-w-[380px] flex-1 flex-wrap gap-2.5"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="df-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="df-newsletter-email"
            type="email"
            placeholder="you@email.com"
            className="h-[52px] min-w-[220px] flex-1 rounded-2xl px-4 text-[15px] text-white outline-none placeholder:text-[#9aa0ab]"
            style={{ backgroundColor: "#1a1d23", border: "1px solid #3a3f4a" }}
          />
          <button
            type="submit"
            className="h-[52px] rounded-2xl px-6 text-[15px] font-bold"
            style={{ backgroundColor: COLORS.accent, color: COLORS.accentInk }}
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
