"use client";

import { useState, type FormEvent } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import { getStripe } from "@/shared/lib/stripe";
import type { FashionColorMode } from "../stores/colorMode.store";
import { getFashionColors, fashionInter } from "../theme";

const paymentElementOptions: StripePaymentElementOptions = {
  layout: "tabs",
  // Stripe auto-injects a "Save my information" (Link) section with its
  // own email/phone/name fields unless explicitly turned off — this store
  // isn't using Link, so it'd just be extra fields shoppers have to skip.
  wallets: { link: "never" },
};

interface PaymentFormProps {
  returnUrl: string;
  onSuccess: () => void;
  colors: ReturnType<typeof getFashionColors>;
}

/**
 * Presentation + Stripe confirmation only — order creation, the payment
 * intent API call, cart clearing, and post-success navigation all live in
 * CheckoutPage.tsx. This component renders the card fields and confirms
 * payment with Stripe, nothing else.
 *
 * `redirect: "if_required"` keeps the shopper on this page for cards that
 * don't need extra authentication (resolves here with paymentIntent.status);
 * a card that needs 3-D Secure redirects the browser away on its own —
 * there's no code path for that here, see /checkout/payment-return.
 */
function PaymentForm({ returnUrl, onSuccess, colors }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsConfirming(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(
        error.message ??
          "Payment failed. Please check your card details and try again.",
      );
      setIsConfirming(false);
      return;
    }

    if (
      paymentIntent &&
      (paymentIntent.status === "succeeded" ||
        paymentIntent.status === "processing")
    ) {
      onSuccess();
      return;
    }

    // Any other outcome (e.g. requires_payment_method after a decline)
    // means Stripe neither redirected nor succeeded — let them retry.
    setIsConfirming(false);
  };

  return (
    <form onSubmit={handleSubmit} className={fashionInter.className}>
      <PaymentElement options={paymentElementOptions} />
      {errorMessage && (
        <p className="mt-3 text-sm" style={{ color: colors.brick }}>
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || isConfirming}
        className="mt-4 h-12 w-full rounded-xl text-sm font-bold uppercase transition-colors hover:bg-[var(--pay-brass-hover)] disabled:opacity-40"
        style={
          {
            backgroundColor: colors.brass,
            color: colors.ink,
            letterSpacing: "0.6px",
            "--pay-brass-hover": colors.brassHover,
          } as React.CSSProperties
        }
      >
        {isConfirming ? "Confirming Payment..." : "Pay Now"}
      </button>
    </form>
  );
}

export interface StripePaymentFormProps {
  clientSecret: string;
  returnUrl: string;
  onSuccess: () => void;
  mode: FashionColorMode;
}

export function StripePaymentForm({
  clientSecret,
  returnUrl,
  onSuccess,
  mode,
}: StripePaymentFormProps) {
  const colors = getFashionColors(mode);

  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        // Stripe's own base preset — "night" only covers the dark half;
        // "stripe" is its light default. The variables below then layer the
        // tenant's brass/ink/bone accents on top of whichever base is active.
        appearance: {
          theme: mode === "dark" ? "night" : "stripe",
          variables: {
            colorPrimary: colors.brass,
            colorBackground: colors.ink,
            colorText: colors.bone,
          },
        },
      }}
    >
      <PaymentForm
        returnUrl={returnUrl}
        onSuccess={onSuccess}
        colors={colors}
      />
    </Elements>
  );
}
