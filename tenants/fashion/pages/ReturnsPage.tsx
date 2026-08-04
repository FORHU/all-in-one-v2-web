"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ClipboardList, Printer, PackageCheck } from "lucide-react";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Request Return",
    description: "Tell us which items you're sending back and why.",
  },
  {
    icon: Printer,
    title: "Print Label",
    description: "We email a prepaid shipping label — no box needed.",
  },
  {
    icon: PackageCheck,
    title: "Get Refund",
    description: "Refunded to your original payment method in 3-5 days.",
  },
];

/**
 * Fashion — returns & exchanges policy page.
 * Request-lookup form is UI-only — there's no GET /v2/returns/lookup
 * endpoint yet, so submitting just shows a toast (same pattern as
 * AccountPage's "Track Package" button).
 */
export function FashionReturnsPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);

  const handleLookup = async (event: FormEvent) => {
    event.preventDefault();
    setIsLookingUp(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsLookingUp(false);
    toast(
      "Return lookup isn't connected to a real order system yet — this is a UI-only demo.",
    );
  };

  return (
    <FashionStorefrontLayout>
      <section
        className="mx-auto max-w-4xl px-6 py-16 sm:py-20"
        style={{ color: "var(--brand-primary)" }}
      >
        <div className="text-center">
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Returns &amp; Exchanges
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm opacity-60">
            Changed your mind? Returning an item is quick, free, and
            hassle-free.
          </p>
        </div>

        {/* 3-step infographic */}
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
          {STEPS.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className="relative flex flex-col items-center text-center"
            >
              {i < STEPS.length - 1 && (
                <div
                  className="absolute left-1/2 top-8 hidden h-px w-full sm:block"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
                  }}
                />
              )}
              <div
                className="relative flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--brand-secondary)",
                }}
              >
                <Icon className="h-6 w-6" strokeWidth={1.75} />
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: "var(--brand-secondary)",
                    color: "var(--brand-primary)",
                    boxShadow: "0 0 0 2px var(--brand-primary)",
                  }}
                >
                  {i + 1}
                </span>
              </div>
              <div className="mt-4 text-sm font-bold">{title}</div>
              <p className="mt-1 max-w-[180px] text-xs opacity-60">
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* Policy callout */}
        <div
          className="mt-14 rounded-2xl px-6 py-8 text-center sm:px-10"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--brand-primary) 5%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--brand-primary) 12%, transparent)",
          }}
        >
          <div className="text-lg font-bold tracking-tight sm:text-xl">
            30-Day Hassle-Free Returns
          </div>
          <p className="mx-auto mt-2 max-w-xl text-sm opacity-70">
            Not the right fit? Return any unworn item with tags attached within
            30 days of delivery for a full refund. Sale items are eligible for
            store credit.
          </p>
        </div>

        {/* Return request lookup */}
        <div className="mt-14">
          <h2 className="text-center text-xl font-bold tracking-tight">
            Start a Return
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-center text-sm opacity-60">
            Enter your order number and email to look up your order.
          </p>

          <form
            onSubmit={handleLookup}
            className="mx-auto mt-6 flex max-w-sm flex-col gap-4 rounded-2xl border border-current/10 p-6"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="orderId"
                className="text-xs font-semibold opacity-70"
              >
                Order ID
              </label>
              <input
                id="orderId"
                type="text"
                required
                placeholder="e.g. 10482"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                className="h-11 rounded-xl border border-current/15 px-3.5 text-sm outline-none focus:border-current/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="returnEmail"
                className="text-xs font-semibold opacity-70"
              >
                Email
              </label>
              <input
                id="returnEmail"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-xl border border-current/15 px-3.5 text-sm outline-none focus:border-current/40"
              />
            </div>

            <button
              type="submit"
              disabled={isLookingUp}
              className="mt-2 h-11 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "var(--brand-secondary)",
              }}
            >
              {isLookingUp ? "Looking up..." : "Find My Order"}
            </button>
          </form>
        </div>
      </section>
    </FashionStorefrontLayout>
  );
}
