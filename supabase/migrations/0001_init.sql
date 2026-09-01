-- WeddingsForOne initial schema
-- Profiles extend Supabase's built-in auth.users with app-specific fields.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  tier text not null default 'free' check (tier in ('free', 'premium')),
  created_at timestamptz not null default now()
);

create table public.vendor_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

insert into public.vendor_categories (slug, name) values
  ('venue', 'Venue'),
  ('photography', 'Photography'),
  ('catering', 'Catering'),
  ('florist', 'Florist'),
  ('officiant', 'Officiant / Celebrant'),
  ('hair_makeup', 'Hair & Makeup'),
  ('transport', 'Transport');

create table public.ceremonies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  vibe text not null check (vibe in ('spiritual', 'glam', 'minimalist', 'gothic_romantic', 'funny')),
  reason text,
  date date,
  location text,
  guest_count int not null default 0,
  budget_band text,
  priority_ranking jsonb not null default '[]'::jsonb,
  status text not null default 'planning' check (status in ('planning', 'confirmed', 'completed')),
  ceremony_script text,
  vows text,
  witness_reading text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ceremony_timeline (
  id uuid primary key default gen_random_uuid(),
  ceremony_id uuid not null references public.ceremonies (id) on delete cascade,
  moment_name text not null,
  time time,
  notes text,
  order_index int not null default 0
);

create table public.vendor_shortlist (
  id uuid primary key default gen_random_uuid(),
  ceremony_id uuid not null references public.ceremonies (id) on delete cascade,
  category_id uuid not null references public.vendor_categories (id),
  place_id text not null,
  name text not null,
  address text,
  rating numeric,
  price_level int,
  ai_rationale text,
  selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  vendor_shortlist_id uuid not null unique references public.vendor_shortlist (id) on delete cascade,
  draft_text text not null,
  status text not null default 'not_sent' check (status in ('not_sent', 'sent', 'replied', 'booked')),
  updated_at timestamptz not null default now()
);

create table public.budget_items (
  id uuid primary key default gen_random_uuid(),
  ceremony_id uuid not null references public.ceremonies (id) on delete cascade,
  category_id uuid not null references public.vendor_categories (id),
  estimated_cost numeric,
  actual_cost numeric,
  vendor_shortlist_id uuid references public.vendor_shortlist (id)
);

-- Row Level Security: every row is only visible to the ceremony's owner.

alter table public.profiles enable row level security;
alter table public.ceremonies enable row level security;
alter table public.ceremony_timeline enable row level security;
alter table public.vendor_shortlist enable row level security;
alter table public.outreach_drafts enable row level security;
alter table public.budget_items enable row level security;

create policy "profiles: owner read/write" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "ceremonies: owner read/write" on public.ceremonies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ceremony_timeline: owner read/write" on public.ceremony_timeline
  for all using (
    exists (select 1 from public.ceremonies c where c.id = ceremony_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.ceremonies c where c.id = ceremony_id and c.user_id = auth.uid())
  );

create policy "vendor_shortlist: owner read/write" on public.vendor_shortlist
  for all using (
    exists (select 1 from public.ceremonies c where c.id = ceremony_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.ceremonies c where c.id = ceremony_id and c.user_id = auth.uid())
  );

create policy "outreach_drafts: owner read/write" on public.outreach_drafts
  for all using (
    exists (
      select 1 from public.vendor_shortlist vs
      join public.ceremonies c on c.id = vs.ceremony_id
      where vs.id = vendor_shortlist_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.vendor_shortlist vs
      join public.ceremonies c on c.id = vs.ceremony_id
      where vs.id = vendor_shortlist_id and c.user_id = auth.uid()
    )
  );

create policy "budget_items: owner read/write" on public.budget_items
  for all using (
    exists (select 1 from public.ceremonies c where c.id = ceremony_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.ceremonies c where c.id = ceremony_id and c.user_id = auth.uid())
  );

-- vendor_categories is public reference data.
alter table public.vendor_categories enable row level security;
create policy "vendor_categories: public read" on public.vendor_categories
  for select using (true);

-- Auto-create a profile row when a new auth user signs up.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
