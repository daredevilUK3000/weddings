-- Wedding Director + Witness Circle (Stage A — foundations only).
--
-- Run this manually in the Supabase SQL editor (this project has no linked
-- Supabase CLI / migration runner — 0001_init.sql and 0002_geoapify_migration.sql
-- were applied the same way).
--
-- Scope: schema for both features' MVP, per the Wedding Director + Witness
-- Circle developer brief. See supabase/migrations/README (or the project's
-- plan history) for the scope calls made here — most notably: witness status
-- is modeled as independent timestamp/status fields rather than one linear
-- enum, sharing toggles are global per-ceremony rather than per-witness, and
-- witness signatures support typed/drawn only (no image upload) in v1.

-- ---------------------------------------------------------------------------
-- Extend ceremonies: wedding-day fields, sharing toggles, fuller lifecycle.
-- ---------------------------------------------------------------------------

alter table public.ceremonies
  add column start_time time,
  add column wedding_day_started_at timestamptz,
  add column ceremony_started_at timestamptz,
  add column livestream_url text,
  add column share_vows boolean not null default false,
  add column share_ceremony_story boolean not null default false,
  add column share_programme boolean not null default false,
  add column share_certificate boolean not null default false,
  add column share_photographs boolean not null default false,
  add column share_livestream boolean not null default true;

alter table public.ceremonies drop constraint ceremonies_status_check;
alter table public.ceremonies add constraint ceremonies_status_check
  check (status in ('planning', 'confirmed', 'preparing', 'ready', 'wedding_day', 'ceremony_active', 'completed'));

-- ---------------------------------------------------------------------------
-- Extend ceremony_timeline: day-of status, without touching who owns the
-- sequence itself (still only ever edited via builder/actions.ts).
-- ---------------------------------------------------------------------------

alter table public.ceremony_timeline
  add column event_status text not null default 'upcoming'
    check (event_status in ('upcoming', 'ready', 'active', 'delayed', 'completed', 'skipped')),
  add column actual_start_at timestamptz,
  add column actual_end_at timestamptz;

-- ---------------------------------------------------------------------------
-- Extend vendor_shortlist: day-of booking status + contact/logistics fields.
-- ---------------------------------------------------------------------------

alter table public.vendor_shortlist
  add column booking_status text not null default 'not_contacted'
    check (booking_status in ('not_contacted', 'contacted', 'responded', 'booked', 'confirmed', 'arrived', 'completed')),
  add column contact_person text,
  add column contact_phone text,
  add column booking_reference text,
  add column arrival_time time,
  add column service_start_time time,
  add column service_end_time time,
  add column amount_outstanding numeric,
  add column vendor_notes text;

-- ---------------------------------------------------------------------------
-- Witness Circle tables.
-- ---------------------------------------------------------------------------

create table public.witnesses (
  id uuid primary key default gen_random_uuid(),
  ceremony_id uuid not null references public.ceremonies (id) on delete cascade,
  name text not null,
  email text not null,
  relationship text,
  attendance_type text not null
    check (attendance_type in ('in_person', 'online', 'remote_contribution', 'witnessing_afterward')),
  can_sign_certificate boolean not null default true,
  invite_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_at timestamptz,
  opened_at timestamptz,
  rsvp_status text check (rsvp_status in ('accepted', 'declined')),
  rsvp_at timestamptz,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.witness_contributions (
  id uuid primary key default gen_random_uuid(),
  witness_id uuid not null references public.witnesses (id) on delete cascade,
  body text not null,
  include_in_ceremony boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.witness_signatures (
  id uuid primary key default gen_random_uuid(),
  witness_id uuid not null unique references public.witnesses (id) on delete cascade,
  signature_type text not null check (signature_type in ('drawn', 'typed')),
  signature_data text not null,
  consent boolean not null default true,
  certificate_version int not null default 1,
  signed_at timestamptz not null default now()
);

-- Internal notification ledger — the enforcement mechanism for the
-- per-recipient notification caps, not just a convention. No client ever
-- queries this directly; only the service-role-backed notification service
-- (src/lib/notifications/send.ts) does, so RLS is enabled with zero policies.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  ceremony_id uuid not null references public.ceremonies (id) on delete cascade,
  recipient_type text not null check (recipient_type in ('user', 'witness')),
  recipient_id uuid,
  notification_type text not null,
  sent_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: owner-scoped, same shape as ceremony_timeline / outreach_drafts.
-- No anon/public policies anywhere here — the Witness Portal reads and
-- writes exclusively through a service-role client that enforces its own
-- token check in application code (src/lib/supabase/witness.ts).
-- ---------------------------------------------------------------------------

alter table public.witnesses enable row level security;
alter table public.witness_contributions enable row level security;
alter table public.witness_signatures enable row level security;
alter table public.notifications enable row level security;

create policy "witnesses: owner read/write" on public.witnesses
  for all using (
    exists (select 1 from public.ceremonies c where c.id = ceremony_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.ceremonies c where c.id = ceremony_id and c.user_id = auth.uid())
  );

create policy "witness_contributions: owner read/write" on public.witness_contributions
  for all using (
    exists (
      select 1 from public.witnesses w
      join public.ceremonies c on c.id = w.ceremony_id
      where w.id = witness_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.witnesses w
      join public.ceremonies c on c.id = w.ceremony_id
      where w.id = witness_id and c.user_id = auth.uid()
    )
  );

create policy "witness_signatures: owner read/write" on public.witness_signatures
  for all using (
    exists (
      select 1 from public.witnesses w
      join public.ceremonies c on c.id = w.ceremony_id
      where w.id = witness_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.witnesses w
      join public.ceremonies c on c.id = w.ceremony_id
      where w.id = witness_id and c.user_id = auth.uid()
    )
  );

-- notifications: RLS enabled, intentionally no policies (deny-by-default).
