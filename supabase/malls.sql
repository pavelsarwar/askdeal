create table if not exists public.malls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  google_maps_url text,
  address_text text,
  city text,
  latitude double precision,
  longitude double precision,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.deals add column if not exists mall_id uuid references public.malls(id) on delete set null;

alter table public.malls enable row level security;
drop policy if exists "Public can read active malls" on public.malls;
create policy "Public can read active malls" on public.malls for select using (active = true);
drop policy if exists "Authenticated users can manage malls" on public.malls;
create policy "Authenticated users can manage malls" on public.malls for all to authenticated using (true) with check (true);
grant select on public.malls to anon;
grant all on public.malls to authenticated;
