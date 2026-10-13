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
import { BEAUTY_MIRROR_COLORS as COLORS } from "../theme";

const paymentElementOptions: StripePaymentElementOptions = {
  layout: "tabs",
  wallets: { link: "never" },
};

interface PaymentFormProps {
  returnUrl: string;
  onSuccess: () => void;
}

/**
 * Beauty — presentation + Stripe confirmation only, mirrors
 * tenants/fashion/components/StripePaymentForm.tsx exactly on behavior
 * (same `redirect: "if_required"` in-page-vs-3DS-redirect split). Order
 * creation, the payment-intent call, cart clearing and post-success
 * navigation all live in pages/CheckoutPage.tsx — this component only
 * renders the card fields and confirms payment with Stripe.
 */
function PaymentForm({ returnUrl, onSuccess }: PaymentFormProps) {
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

    setIsConfirming(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={paymentElementOptions} />
      {errorMessage && (
        <p className="mt-3 text-sm" style={{ color: "#B3473D" }}>
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || isConfirming}
        className="mt-4 h-12 w-full rounded-xl text-sm font-bold uppercase tracking-wide disabled:opacity-40"
        style={{ backgroundColor: COLORS.ink, color: COLORS.accentInk }}
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
}

export function StripePaymentForm({
  clientSecret,
  returnUrl,
  onSuccess,
}: StripePaymentFormProps) {
  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: COLORS.ink,
            colorBackground: COLORS.surface,
            colorText: COLORS.ink,
          },
        },
      }}
    >
      <PaymentForm returnUrl={returnUrl} onSuccess={onSuccess} />
    </Elements>
  );
}
