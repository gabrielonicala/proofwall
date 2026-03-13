import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_IDS } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, interval, projectId } = body as {
      plan: "pro" | "business";
      interval: "month" | "year";
      projectId: string;
    };

    // Validate inputs
    if (!plan || !interval || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!PRICE_IDS[plan]?.[interval]) {
      return NextResponse.json({ error: "Invalid plan or interval" }, { status: 400 });
    }

    // Verify user is owner of the project
    const { data: member } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!member || member.role !== "owner") {
      return NextResponse.json(
        { error: "Only the project owner can manage billing" },
        { status: 403 }
      );
    }

    // Check if there's already a Stripe customer for this project
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("project_id", projectId)
      .limit(1)
      .single();

    const priceId = PRICE_IDS[plan][interval];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/dashboard/settings?billing=success`,
      cancel_url: `${req.nextUrl.origin}/dashboard/settings?billing=cancelled`,
      metadata: {
        project_id: projectId,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          project_id: projectId,
        },
      },
    };

    // Reuse existing Stripe customer if we have one
    if (existingSub?.stripe_customer_id) {
      sessionParams.customer = existingSub.stripe_customer_id;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
