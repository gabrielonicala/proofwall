import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

/**
 * Maps plan + interval to Stripe Price IDs.
 * Set these in .env.local from your Stripe Dashboard.
 */
export const PRICE_IDS = {
  pro: {
    month: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    year: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  },
  business: {
    month: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!,
    year: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID!,
  },
} as const;

/** Reverse lookup: Stripe Price ID → plan name */
export function planFromPriceId(priceId: string): "pro" | "business" | null {
  for (const [plan, intervals] of Object.entries(PRICE_IDS)) {
    if (Object.values(intervals).includes(priceId)) {
      return plan as "pro" | "business";
    }
  }
  return null;
}
