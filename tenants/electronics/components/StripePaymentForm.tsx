"use client";

import { useState, type FormEvent } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import { Lock } from "lucide-react";
import { getStripe } from "@/shared/lib/stripe";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

const paymentElementOptions: StripePaymentElementOptions = {
  layout: "tabs",
  wallets: { link: "never" },
};

interface PaymentFormProps {
  returnUrl: string;
  submitLabel: string;
  onSuccess: () => void;
}

/**
 * DigitFriend — presentation + Stripe confirmation only, mirrors
 * tenants/beauty/components/StripePaymentForm.tsx exactly on behavior
 * (same `redirect: "if_required"` in-page-vs-3DS-redirect split). Order
 * creation, the payment-intent call, cart clearing and post-success
 * navigation all live in pages/CheckoutPage.tsx — this component only
 * renders the card fields and confirms payment with Stripe.
 */
function PaymentForm({ returnUrl, submitLabel, onSuccess }: PaymentFormProps) {
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
        <p className="mt-3 text-sm" style={{ color: COLORS.wishlist }}>
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || isConfirming}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold disabled:opacity-40"
        style={{ backgroundColor: COLORS.ink, color: "#ffffff" }}
      >
        <Lock className="h-4 w-4" style={{ color: COLORS.accent }} />
        {isConfirming ? "Confirming payment..." : submitLabel}
      </button>
    </form>
  );
}

export interface StripePaymentFormProps {
  clientSecret: string;
  returnUrl: string;
  /** Pay button text, e.g. "Pay $15.88". */
  submitLabel?: string;
  onSuccess: () => void;
}

export function StripePaymentForm({
  clientSecret,
  returnUrl,
  submitLabel = "Pay now",
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
            colorBackground: COLORS.cardBg,
            colorText: COLORS.ink,
            borderRadius: "10px",
          },
        },
      }}
    >
      <PaymentForm
        returnUrl={returnUrl}
        submitLabel={submitLabel}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
