"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronDown,
  CreditCard,
  Headphones,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

type Topic = {
  id: string;
  title: string;
  blurb: string;
  Icon: LucideIcon;
  faqs: { q: string; a: string }[];
};

/**
 * Answers describe only what the storefront actually does today (live
 * shipping quotes at checkout, Stripe card payments, order status + cancel
 * of PENDING orders on /account). The returns/warranty wording mirrors the
 * PDP's own "30-day returns" / "Extended cover included" badges.
 * TODO: have the business confirm the policy wording before launch.
 */
const TOPICS: Topic[] = [
  {
    id: "shipping",
    title: "Shipping & delivery",
    blurb: "Rates, delivery times and tracking",
    Icon: Truck,
    faqs: [
      {
        q: "How much does shipping cost?",
        a: "Shipping is calculated at checkout from live carrier rates for your address. You'll see every available option and its price before you pay.",
      },
      {
        q: "How long will delivery take?",
        a: "Each shipping option shows its estimated delivery window at checkout, and your order confirmation shows the expected delivery dates for the option you picked.",
      },
      {
        q: "Which countries do you ship to?",
        a: "Choose your country when you add a delivery address at checkout. If no shipping options appear for your address, we can't deliver there yet.",
      },
      {
        q: "Where can I see my order's status?",
        a: "Sign in and open your Account page — every order is listed there with its current status.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & refunds",
    blurb: "30-day no-hassle returns",
    Icon: RotateCcw,
    faqs: [
      {
        q: "What is your return policy?",
        a: "You can return items within 30 days of delivery. Send us your order number and the item you'd like to return using the contact form below.",
      },
      {
        q: "How do refunds work?",
        a: "Once your return is approved, the refund goes back to the card you paid with.",
      },
    ],
  },
  {
    id: "warranty",
    title: "Warranty",
    blurb: "Extended cover included",
    Icon: ShieldCheck,
    faqs: [
      {
        q: "Do products come with a warranty?",
        a: "Yes — DigitFriend products include extended warranty cover. If something stops working, contact us with your order number and a short description of the problem.",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders & payments",
    blurb: "Payment methods and cancellations",
    Icon: CreditCard,
    faqs: [
      {
        q: "Which payment methods do you accept?",
        a: "We accept credit and debit cards, processed securely by Stripe.",
      },
      {
        q: "Is checkout secure?",
        a: "Yes. Card details are entered directly into Stripe's secure payment form and are never stored by DigitFriend.",
      },
      {
        q: "Can I cancel my order?",
        a: "Orders that are still pending can be cancelled from your Account page. Once an order is being processed, contact us and we'll see what we can do.",
      },
    ],
  },
];

const cardStyle: React.CSSProperties = {
  backgroundColor: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
};
const inputStyle: React.CSSProperties = {
  backgroundColor: COLORS.cardBg,
  border: `1px solid ${COLORS.borderStrong}`,
  color: COLORS.ink,
};

/**
 * DigitFriend — /support, the header's "Support" link (and the footer's
 * Help links, via #shipping/#returns/#warranty/#contact). A help hero whose
 * search filters the FAQ live, topic cards that jump to each FAQ group, the
 * FAQ itself as native <details> accordions, and a contact panel.
 *
 * The contact form is UI only — there's no support-ticket/email endpoint in
 * the API yet, so submitting says so instead of pretending it was sent.
 * TODO: wire to a real support channel.
 */
export function ElectronicsSupportPage() {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    order: "",
    message: "",
  });

  const normalized = query.trim().toLowerCase();
  const visibleTopics = useMemo(
    () =>
      TOPICS.map((t) => ({
        ...t,
        faqs: normalized
          ? t.faqs.filter((f) =>
              `${f.q} ${f.a}`.toLowerCase().includes(normalized),
            )
          : t.faqs,
      })).filter((t) => t.faqs.length > 0),
    [normalized],
  );
  const matchCount = visibleTopics.reduce((n, t) => n + t.faqs.length, 0);

  const updateField =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const canSubmit =
    form.name.trim() && form.email.trim() && form.message.trim();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    toast.info(
      "Support messages aren't connected yet — this form is a preview.",
    );
  };

  return (
    <ElectronicsStorefrontLayout>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-14 pt-7">
        <nav
          aria-label="Breadcrumb"
          className="flex gap-2 text-[13px]"
          style={{ color: COLORS.muted }}
        >
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: COLORS.ink }}>Support</span>
        </nav>

        {/* Hero + FAQ search */}
        <section
          className="flex flex-col items-center gap-5 rounded-[28px] px-6 py-12 text-center sm:py-14"
          style={{ backgroundColor: COLORS.ink, colorScheme: "dark" }}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: COLORS.accent }}
          >
            <Headphones size={24} color={COLORS.accentInk} />
          </span>
          <h1
            className="m-0 text-4xl font-bold tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            How can we help?
          </h1>
          <p
            className="m-0 max-w-md text-base"
            style={{ color: COLORS.headerMuted }}
          >
            Answers about shipping, returns, warranty and payments — or reach
            our team directly.
          </p>
          <label
            className="flex h-14 w-full max-w-xl items-center gap-3 rounded-2xl px-4"
            style={{
              backgroundColor: COLORS.headerPanelBg,
              border: `1px solid ${COLORS.headerPanelBorder}`,
            }}
          >
            <Search size={20} color="#9aa0ab" aria-hidden="true" />
            <span className="sr-only">Search help articles</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search e.g. “refund”, “delivery time”…"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#9aa0ab]"
            />
          </label>
        </section>

        {/* Topic cards */}
        {!normalized && (
          <section
            aria-label="Help topics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {TOPICS.map(({ id, title, blurb, Icon, faqs }) => (
              <a
                key={id}
                href={`#${id}`}
                className="group flex flex-col gap-4 rounded-[22px] p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,17,21,0.08)]"
                style={cardStyle}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  <Icon size={20} color={COLORS.accentInk} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-base font-bold">{title}</span>
                  <span className="text-sm" style={{ color: COLORS.muted }}>
                    {blurb}
                  </span>
                </span>
                <span
                  className="mt-auto text-xs font-medium uppercase tracking-wide"
                  style={{
                    color: COLORS.muted,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {faqs.length} {faqs.length === 1 ? "article" : "articles"} →
                </span>
              </a>
            ))}
          </section>
        )}

        {/* FAQ */}
        <section
          aria-label="Frequently asked questions"
          className="flex flex-col gap-8"
        >
          <div className="flex items-baseline gap-3">
            <h2
              className="m-0 text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {normalized ? "Search results" : "Frequently asked questions"}
            </h2>
            {normalized && (
              <span
                className="text-[13px]"
                style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
              >
                {matchCount} {matchCount === 1 ? "answer" : "answers"}
              </span>
            )}
          </div>

          {visibleTopics.length === 0 ? (
            <div
              className="flex flex-col items-center gap-2 rounded-[22px] px-6 py-12 text-center"
              style={{
                backgroundColor: COLORS.cardBg,
                border: `1px dashed ${COLORS.borderStrong}`,
              }}
            >
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                No answers match “{query.trim()}”
              </span>
              <span className="text-sm" style={{ color: COLORS.muted }}>
                Try another word, or send us a message below.
              </span>
            </div>
          ) : (
            visibleTopics.map(({ id, title, Icon, faqs }) => (
              <div
                key={id}
                id={id}
                className="grid scroll-mt-6 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]"
              >
                <div className="flex items-center gap-3 lg:items-start lg:pt-4">
                  <Icon size={20} />
                  <h3 className="m-0 text-lg font-bold">{title}</h3>
                </div>
                <div className="flex flex-col gap-2.5">
                  {faqs.map((faq) => (
                    <details
                      key={faq.q}
                      open={!!normalized}
                      className="group rounded-[18px] px-5 [&_summary::-webkit-details-marker]:hidden"
                      style={cardStyle}
                    >
                      <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-3 text-[15px] font-semibold">
                        {faq.q}
                        <span
                          className="flex h-7 w-7 flex-none items-center justify-center rounded-full transition-transform group-open:rotate-180"
                          style={{ backgroundColor: COLORS.bg }}
                        >
                          <ChevronDown size={16} />
                        </span>
                      </summary>
                      <p
                        className="m-0 pb-5 pr-10 text-[15px] leading-relaxed"
                        style={{ color: COLORS.muted }}
                      >
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="grid scroll-mt-6 gap-6 rounded-[28px] p-6 sm:p-8 lg:grid-cols-[1fr_1.3fr]"
          style={cardStyle}
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
              >
                Contact support
              </span>
              <h2
                className="m-0 text-3xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Still need help?
              </h2>
              <p className="m-0 text-[15px]" style={{ color: COLORS.muted }}>
                Our team is here 24/7. Include your order number and we&rsquo;ll
                get you sorted faster.
              </p>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-4 rounded-[18px] p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,17,21,0.08)]"
              style={{
                backgroundColor: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <span
                className="flex h-11 w-11 flex-none items-center justify-center rounded-xl"
                style={{ backgroundColor: COLORS.ink }}
              >
                <Package size={20} color={COLORS.accent} />
              </span>
              <span className="flex flex-col">
                <span className="text-[15px] font-bold">Check an order</span>
                <span className="text-sm" style={{ color: COLORS.muted }}>
                  See status or cancel a pending order in your account
                </span>
              </span>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                className="flex flex-col gap-1.5 text-xs font-semibold"
                style={{ color: COLORS.muted }}
              >
                Name
                <input
                  value={form.name}
                  onChange={updateField("name")}
                  autoComplete="name"
                  className="h-11 rounded-xl px-3.5 text-sm outline-none"
                  style={inputStyle}
                />
              </label>
              <label
                className="flex flex-col gap-1.5 text-xs font-semibold"
                style={{ color: COLORS.muted }}
              >
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  autoComplete="email"
                  className="h-11 rounded-xl px-3.5 text-sm outline-none"
                  style={inputStyle}
                />
              </label>
            </div>
            <label
              className="flex flex-col gap-1.5 text-xs font-semibold"
              style={{ color: COLORS.muted }}
            >
              Order number (optional)
              <input
                value={form.order}
                onChange={updateField("order")}
                className="h-11 rounded-xl px-3.5 text-sm outline-none"
                style={inputStyle}
              />
            </label>
            <label
              className="flex flex-col gap-1.5 text-xs font-semibold"
              style={{ color: COLORS.muted }}
            >
              How can we help?
              <textarea
                value={form.message}
                onChange={updateField("message")}
                rows={5}
                className="resize-y rounded-xl px-3.5 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </label>
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-1 h-12 rounded-xl text-sm font-bold text-white disabled:opacity-40"
              style={{ backgroundColor: COLORS.ink }}
            >
              Send message
            </button>
          </form>
        </section>
      </div>
    </ElectronicsStorefrontLayout>
  );
}
