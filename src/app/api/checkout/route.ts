import { createClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/base-url";
import { stripe, UNLOCK_PRICE_USD_CENTS } from "@/lib/stripe";

// Creates a one-time (mode: "payment", not "subscription") Checkout Session
// for the $49 permanent account unlock. The webhook — not this route's
// response, and not the success redirect — is what actually sets
// unlocked_at; this only starts the Stripe-hosted checkout.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = await getBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: UNLOCK_PRICE_USD_CENTS,
          product_data: {
            name: "WeddingsForOne — Permanent Ceremony Unlock",
            description: "One-time payment. Unlocks your account permanently — no subscription.",
          },
        },
        quantity: 1,
      },
    ],
    client_reference_id: user.id,
    metadata: { userId: user.id },
    success_url: `${baseUrl}/unlocked?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/locked`,
  });

  if (!session.url) {
    return Response.json({ error: "Could not start checkout" }, { status: 500 });
  }

  return Response.json({ url: session.url });
}
