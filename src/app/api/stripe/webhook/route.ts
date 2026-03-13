import { NextRequest, NextResponse } from "next/server";
import { stripe, planFromPriceId } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import Stripe from "stripe";

// Supabase admin client (bypasses RLS)
function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const projectId = session.metadata?.project_id;
        if (!projectId) {
          console.error("No project_id in checkout session metadata");
          break;
        }

        // Fetch the full subscription to get price details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0]?.price.id;
        const plan = planFromPriceId(priceId ?? "");

        if (!plan) {
          console.error("Unknown price ID:", priceId);
          break;
        }

        // In Stripe v20, current_period fields are on SubscriptionItem, not Subscription
        const firstItem = subscription.items.data[0];
        const periodStart = firstItem?.current_period_start;
        const periodEnd = firstItem?.current_period_end;

        // Upsert subscription record
        await supabase.from("subscriptions").upsert(
          {
            project_id: projectId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: priceId!,
            interval: firstItem?.price.recurring?.interval ?? "month",
            current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
          },
          { onConflict: "stripe_subscription_id" }
        );

        // Update project plan
        await supabase
          .from("projects")
          .update({ plan })
          .eq("id", projectId);

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const projectId = subscription.metadata?.project_id;
        if (!projectId) break;

        const priceId = subscription.items.data[0]?.price.id;
        const plan = planFromPriceId(priceId ?? "");

        // In Stripe v20, current_period fields are on SubscriptionItem, not Subscription
        const subItem = subscription.items.data[0];
        const subPeriodStart = subItem?.current_period_start;
        const subPeriodEnd = subItem?.current_period_end;

        // Update subscription record
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            price_id: priceId ?? "",
            interval: subItem?.price.recurring?.interval ?? "month",
            current_period_start: subPeriodStart ? new Date(subPeriodStart * 1000).toISOString() : null,
            current_period_end: subPeriodEnd ? new Date(subPeriodEnd * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id);

        // Update project plan (handles upgrades/downgrades)
        if (plan && subscription.status === "active") {
          await supabase
            .from("projects")
            .update({ plan })
            .eq("id", projectId);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const projectId = subscription.metadata?.project_id;
        if (!projectId) break;

        // Update subscription status
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        // Downgrade project to free
        await supabase
          .from("projects")
          .update({ plan: "free" })
          .eq("id", projectId);

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // In Stripe v20, subscription is accessed via parent.subscription_details
        const invoiceSubscription = invoice.parent?.subscription_details?.subscription;
        const subscriptionId = typeof invoiceSubscription === "string"
          ? invoiceSubscription
          : invoiceSubscription?.id ?? null;
        if (!subscriptionId) break;

        // Mark subscription as past_due
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId);

        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
