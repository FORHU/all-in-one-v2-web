"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getStripe } from "@/shared/lib/stripe";
import { getOrderById } from "@/features/storefront/api/orders.client";
import { BeautyStorefrontLayout } from "../layouts/StorefrontLayout";
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 8;

/**
 * Beauty — landing page for a 3-D Secure redirect back from Stripe, mirrors
 * tenants/fashion/pages/PaymentReturnPage.tsx exactly on behavior: polls
 * GET /v2/orders/:id for the webhook-driven flip to PROCESSING rather than
 * trusting the redirect alone, then hands off to /order-success, which
 * renders off the useLastOrderStore snapshot CheckoutPage.tsx already
 * wrote before redirecting to Stripe.
 */
export function BeautyPaymentReturnPage({
  tenantSlug,
}: {
  tenantSlug: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"confirming" | "finalizing">(
    "confirming",
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const clientSecret = searchParams.get("payment_intent_client_secret");
      const orderId = searchParams.get("orderId");

      if (!clientSecret || !orderId) {
        router.replace("/checkout");
        return;
      }

      const stripe = await getStripe();
      if (!stripe) {
        router.replace("/checkout");
        return;
      }

      const { paymentIntent } =
        await stripe.retrievePaymentIntent(clientSecret);

      if (
        !paymentIntent ||
        (paymentIntent.status !== "succeeded" &&
          paymentIntent.status !== "processing")
      ) {
        if (!cancelled) {
          toast.error("Payment was not completed. Please try again.");
          router.replace("/checkout");
        }
        return;
      }

      if (cancelled) return;
      setStatus("finalizing");

      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        if (cancelled) return;
        try {
          const order = await getOrderById(tenantSlug, orderId);
          if (order.status === "PROCESSING") {
            router.replace("/order-success");
            return;
          }
        } catch {
          // Transient read failure — keep polling until MAX_POLL_ATTEMPTS.
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      if (!cancelled) router.replace("/order-success");
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router, tenantSlug]);

  return (
    <BeautyStorefrontLayout>
      <div style={{ backgroundColor: COLORS.bg }}>
        <div
          className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
          style={{ color: COLORS.ink }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              fontFamily: "var(--font-heading)",
            }}
          >
            {status === "finalizing"
              ? "Finalizing your order..."
              : "Confirming payment..."}
          </h1>
          <p className="text-sm" style={{ color: COLORS.muted }}>
            This only takes a moment. Please don&apos;t close this page.
          </p>
        </div>
      </div>
    </BeautyStorefrontLayout>
  );
}
