-- NAPS dynamic homepage featured section
-- Run once in Supabase SQL Editor after schema.sql and offers-cms-v2.sql.

create table if not exists public.homepage_settings (
  id bigint primary key default 1 check (id = 1),
  eyebrow text not null default 'HAPPENING NOW',
  title text not null default 'Up to 70% OFF',
  subtitle text not null default 'Warehouse & clearance sales',
  link_url text not null default 'deals.html?period=clearance',
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.homepage_settings(id,eyebrow,title,subtitle,link_url,active)
values (1,'HAPPENING NOW','Up to 70% OFF','Warehouse & clearance sales','deals.html?period=clearance',true)
on conflict (id) do nothing;

alter table public.homepage_settings enable row level security;

drop policy if exists "public read homepage settings" on public.homepage_settings;
create policy "public read homepage settings"
on public.homepage_settings for select
to anon, authenticated
using (true);

drop policy if exists "admin write homepage settings" on public.homepage_settings;
create policy "admin write homepage settings"
on public.homepage_settings for all
to authenticated
using ((select public.is_naps_admin()))
with check ((select public.is_naps_admin()));

-- Optional coordinates for more accurate nearby sorting.
alter table public.deals add column if not exists latitude numeric(10,7);
alter table public.deals add column if not exists longitude numeric(10,7);
