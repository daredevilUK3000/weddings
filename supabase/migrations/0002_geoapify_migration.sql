-- Migrate vendor search from Google Places to Geoapify (OSM-based).
--
-- Run this manually in the Supabase SQL editor (this project has no linked
-- Supabase CLI / migration runner — 0001_init.sql was applied the same way).
--
-- Google's `rating` and `price_level` have no OpenStreetMap equivalent, so
-- they're dropped rather than left to silently stop being populated.
-- `place_id` is kept (already provider-agnostic in the schema) but now
-- holds a Geoapify place identifier instead of a Google one — existing
-- rows from before this migration have stale Google place_ids and won't
-- match anything in Geoapify; leave them as historical shortlist entries
-- (they still have a name/address/rationale) rather than deleting them.

alter table public.vendor_shortlist
  drop column if exists rating,
  drop column if exists price_level;

-- Vendor search result cache, keyed by category + normalized location text.
-- Geoapify's terms (unlike Google's) permit storing and reusing results —
-- this cuts call volume for repeat searches of the same area. Only the
-- generic place data (name/address/id) is cached; the AI rationale stays
-- per-request since it's personalized to each client's vibe/budget/priorities.
create table public.vendor_cache (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null,
  location_key text not null,
  results jsonb not null,
  fetched_at timestamptz not null default now(),
  unique (category_slug, location_key)
);

alter table public.vendor_cache enable row level security;

-- Shared, non-sensitive reference-style data (place names/addresses) — same
-- spirit as vendor_categories' public-read policy, but writable by any
-- signed-in user since search requests populate it on the fly.
create policy "vendor_cache: read" on public.vendor_cache
  for select using (true);

create policy "vendor_cache: authenticated write" on public.vendor_cache
  for insert to authenticated with check (true);

create policy "vendor_cache: authenticated update" on public.vendor_cache
  for update to authenticated using (true) with check (true);
