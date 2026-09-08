import Stripe from "stripe";

// One shared client for both the checkout-session route and the webhook
// handler — both need the same secret key, nothing provider-specific to
// either call site.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// $49 one-time unlock. Kept as price_data inline rather than a Stripe
// Dashboard Product/Price so there's no dashboard-side setup step beyond
// having an API key — see the Stripe integration brief's own note on this.
export const UNLOCK_PRICE_USD_CENTS = 4900;
