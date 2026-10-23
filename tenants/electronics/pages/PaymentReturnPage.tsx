"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getStripe } from "@/shared/lib/stripe";
import { getOrderById } from "@/features/storefront/api/orders.client";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 8;

/**
 * DigitFriend — landing page for a 3-D Secure redirect back from Stripe,
 * mirrors tenants/beauty/pages/PaymentReturnPage.tsx exactly on behavior:
 * polls GET /v2/orders/:id for the webhook-driven flip to PROCESSING rather
 * than trusting the redirect alone, then hands off to /order-success, which
 * renders off the useLastOrderStore snapshot CheckoutPage.tsx already wrote
 * before redirecting to Stripe.
 */
export function ElectronicsPaymentReturnPage({
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
      // Carried through from CheckoutPage so a Buy Now purchase lands back
      // on the right checkout and clears only the Buy Now item on success.
      const modeQuery =
        searchParams.get("mode") === "buy-now" ? "?mode=buy-now" : "";
      const checkoutUrl = `/checkout${modeQuery}`;
      const successUrl = `/order-success${modeQuery}`;

      if (!clientSecret || !orderId) {
        router.replace(checkoutUrl);
        return;
      }

      const stripe = await getStripe();
      if (!stripe) {
        router.replace(checkoutUrl);
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
          router.replace(checkoutUrl);
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
            router.replace(successUrl);
            return;
          }
        } catch {
          // Transient read failure — keep polling until MAX_POLL_ATTEMPTS.
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      if (!cancelled) router.replace(successUrl);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router, tenantSlug]);

  return (
    <ElectronicsStorefrontLayout>
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <span
          className="h-10 w-10 animate-spin rounded-full border-[3px]"
          style={{
            borderColor: COLORS.border,
            borderTopColor: COLORS.ink,
          }}
          aria-hidden="true"
        />
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {status === "finalizing"
            ? "Finalizing your order..."
            : "Confirming payment..."}
        </h1>
        <p className="text-sm" style={{ color: COLORS.muted }}>
          This only takes a moment. Please don&apos;t close this page.
        </p>
      </div>
    </ElectronicsStorefrontLayout>
  );
}
