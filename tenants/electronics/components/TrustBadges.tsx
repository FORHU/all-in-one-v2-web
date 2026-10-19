import { DIGITFRIEND_COLORS as COLORS } from "../theme";

const badges: { title: string; detail: string; path: React.ReactNode }[] = [
  {
    title: "Shipping at checkout",
    detail: "Live rates for your address, shown before you pay.",
    path: (
      <>
        <path d="M1 6h13v10H1zM14 10h4l3 3v3h-7" />
        <circle cx="5.5" cy="18" r="1.8" />
        <circle cx="17.5" cy="18" r="1.8" />
      </>
    ),
  },
  {
    title: "Secure checkout",
    detail: "Encrypted payments, every time.",
    path: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  },
  {
    title: "Easy returns",
    detail: "30-day return window, no hassle.",
    path: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
      </>
    ),
  },
];

/**
 * DigitFriend — value props, matching the "digitfriend ui.html" reference's
 * section id="help" exactly (same id, since the header's "Support" nav
 * anchors here), restyled to the light cream palette with the reference's
 * black icon circle + lime-stroke icon treatment. The shipping badge states
 * what checkout actually does (a live CJ freight quote) — the reference's
 * "Free 2-day shipping" isn't true for CJ-fulfilled orders.
 */
export function TrustBadges() {
  return (
    <section id="help" className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {badges.map((b) => (
          <div
            key={b.title}
            className="flex items-start gap-4 rounded-[20px] p-6"
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <span
              className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px]"
              style={{ backgroundColor: COLORS.ink }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {b.path}
              </svg>
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[17px] font-bold">{b.title}</span>
              <span
                className="text-[15px] leading-relaxed"
                style={{ color: COLORS.muted }}
              >
                {b.detail}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
