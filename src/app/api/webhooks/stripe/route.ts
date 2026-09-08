import { createServiceClient } from "@/lib/supabase/service";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

// The sole source of truth for unlocking an account — never the client-side
// success redirect, which can be spoofed or interrupted. Runs with no
// Supabase session (Stripe calls this server-to-server), so it uses the
// service-role client and enforces its own authorization via the Stripe
// signature instead of RLS.
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id ?? session.metadata?.userId;

    if (userId) {
      const supabase = createServiceClient();
      // Scoped to unlocked_at is null: a retried/duplicate delivery of the
      // same event matches zero rows the second time and no-ops harmlessly,
      // rather than needing separate event-id dedup bookkeeping.
      await supabase
        .from("profiles")
        .update({
          unlocked_at: new Date().toISOString(),
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
        })
        .eq("id", userId)
        .is("unlocked_at", null);
    }
  }

  return Response.json({ received: true });
}
