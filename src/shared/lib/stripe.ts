import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { env } from "./env";

let stripePromise: Promise<Stripe | null> | undefined;

/**
 * Single app-wide Stripe.js instance. `loadStripe()` fetches and caches
 * Stripe's own script internally, but calling it more than once still
 * duplicates that work — this memoizes it at the module level instead.
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}
