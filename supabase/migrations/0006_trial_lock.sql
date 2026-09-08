-- 14-day full-access trial + one-time unlock (see WeddingsStuff for Claude/
-- weddingsforone-monetization-trial-lock.md). Every account gets 14 days of
-- full, unrestricted access from signup; after that, ceremony-related
-- routes redirect to a locked screen until unlocked_at is set. Setting
-- unlocked_at is out of scope here — it's the hook a future payment
-- integration (Stripe or similar) writes to on successful payment.
--
-- Run this manually in the Supabase SQL editor, same as 0001-0005.

alter table public.profiles
  add column trial_ends_at timestamptz not null default (now() + interval '14 days'),
  add column unlocked_at timestamptz;

-- Grandfather every account that already existed before this feature
-- shipped, founder's own account included — nobody currently using the app
-- should be retroactively locked out without warning. New signups after
-- this migration get the real 14-day trial via the column default above.
update public.profiles set unlocked_at = now();
