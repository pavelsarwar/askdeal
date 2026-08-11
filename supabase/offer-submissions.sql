-- NAPS public offer submission + admin approval workflow
-- Safe to re-run in Supabase SQL Editor.

create table if not exists public.offer_submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_name text,
  submitter_email text,
  submitter_phone text,
  merchant_name text not null,
  title text not null,
  category_name text,
  offer_type text not null default 'sale',
  state_name text,
  city text,
  location_text text,
  google_maps_url text,
  discount_text text,
  start_at timestamptz,
  end_at timestamptz,
  description text,
  details_html text,
  source_url text,
  image_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  approved_deal_id uuid references public.deals(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Upgrade existing installations safely.
alter table public.offer_submissions add column if not exists google_maps_url text;
alter table public.offer_submissions add column if not exists details_html text;

alter table public.offer_submissions enable row level security;

drop policy if exists "public can submit offers" on public.offer_submissions;
create policy "public can submit offers"
on public.offer_submissions for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "admins manage submissions" on public.offer_submissions;
create policy "admins manage submissions"
on public.offer_submissions for all
to authenticated
using ((select public.is_naps_admin()))
with check ((select public.is_naps_admin()));

create index if not exists offer_submissions_status_idx on public.offer_submissions(status,created_at desc);
