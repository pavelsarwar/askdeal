-- Ask Deal: Merchant / Shop / Mall master location fields
alter table public.merchants add column if not exists google_maps_url text;
alter table public.merchants add column if not exists address_text text;
alter table public.merchants add column if not exists city text;
alter table public.merchants add column if not exists latitude double precision;
alter table public.merchants add column if not exists longitude double precision;

-- Existing merchants table is already used by Offer Posts.
-- Run this once in Supabase SQL Editor.