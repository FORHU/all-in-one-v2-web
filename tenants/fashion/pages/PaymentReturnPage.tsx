"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getStripe } from "@/shared/lib/stripe";
import { getOrderById } from "@/features/storefront/api/orders.client";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { FASHION_DARK_COLORS, fashionFraunces, fashionInter } from "../theme";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 8; // ~16s — generous for a local `stripe listen` forward

/**
 * Landing page for a 3-D Secure redirect back from Stripe (see
 * StripePaymentForm's confirmPayment call, wired up from
 * pages/CheckoutPage.tsx, which supplies this page's URL as `return_url`).
 * Stripe appends its own `payment_intent`/`payment_intent_client_secret`/
 * `redirect_status` params; `orderId` is ours, added so this page knows
 * which order to check.
 *
 * Stripe confirming the charge client-side is not the same as the order
 * actually being paid — that only happens once Stripe's webhook lands on
 * the backend (see the API's PaymentService.handleWebhook) and flips the
 * order to PROCESSING. This page polls GET /v2/orders/:id for that instead
 * of trusting the redirect alone, same principle as
 * CheckoutPage.tsx's in-page confirmation path.
 *
 * The order-success page itself renders off useLastOrderStore, which
 * CheckoutPage.tsx already wrote before redirecting to Stripe — this page
 * doesn't need to (and must not) write payment/order state itself.
 */
export function FashionPaymentReturnPage({
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

      // Stripe already confirmed the charge, so a still-PENDING order here
      // means a slow webhook, not a failure — send them on rather than
      // leaving a stuck spinner. /order-success renders off the
      // useLastOrderStore snapshot CheckoutPage.tsx already wrote.
      if (!cancelled) router.replace("/order-success");
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router, tenantSlug]);

  return (
    <FashionStorefrontLayout>
      <div
        className={fashionInter.className}
        style={{ backgroundColor: FASHION_DARK_COLORS.ink }}
      >
        <div
          className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
          style={{ color: FASHION_DARK_COLORS.bone }}
        >
          <h1
            className={fashionFraunces.className}
            style={{ fontSize: 24, fontWeight: 600 }}
          >
            {status === "finalizing"
              ? "Finalizing your order..."
              : "Confirming payment..."}
          </h1>
          <p className="text-sm" style={{ color: FASHION_DARK_COLORS.boneDim }}>
            This only takes a moment. Please don&apos;t close this page.
          </p>
        </div>
      </div>
    </FashionStorefrontLayout>
  );
}
