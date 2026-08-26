alter table public.deals add column if not exists formatted_address text;
alter table public.deals add column if not exists google_place_id text;
alter table public.deals add column if not exists google_maps_url text;
