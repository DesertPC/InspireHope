import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook Error: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};

      // Update donation by session id (stored as stripe_payment_intent_id temporarily)
      const { error } = await supabaseAdmin
        .from("donations")
        .update({
          payment_status: "succeeded",
          stripe_payment_intent_id: session.payment_intent as string || session.id,
          stripe_customer_id: session.customer as string || null,
          stripe_subscription_id: session.subscription as string || null,
        })
        .eq("stripe_payment_intent_id", session.id);

      if (error) {
        console.error("Webhook update error (checkout.session.completed):", error);
      }
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { error } = await supabaseAdmin
        .from("donations")
        .update({
          payment_status: "succeeded",
          stripe_payment_intent_id: paymentIntent.id,
        })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      if (error) {
        console.error("Webhook update error (payment_intent.succeeded):", error);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { error } = await supabaseAdmin
        .from("donations")
        .update({ payment_status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      if (error) {
        console.error("Webhook update error (payment_intent.payment_failed):", error);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
