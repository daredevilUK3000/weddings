-- Stripe one-time $49 account unlock (see WeddingsStuff for Claude/
-- weddingsforone-stripe-integration-brief.md). unlocked_at already exists
-- on profiles from 0006_trial_lock.sql — this migration only adds the
-- record-keeping columns for support lookups. The webhook is the sole
-- writer of all three columns; no application code reads
-- stripe_checkout_session_id/stripe_payment_intent_id today.
--
-- Run this manually in the Supabase SQL editor, same as 0001-0006.

alter table public.profiles
  add column stripe_checkout_session_id text,
  add column stripe_payment_intent_id text;
