-- NAPS Offers CMS v2 migration
-- Run this ONCE in Supabase SQL Editor after the main schema.sql.

alter table public.deals add column if not exists offer_type text not null default 'sale';
alter table public.deals add column if not exists content_html text;
alter table public.deals add column if not exists location_text text;
alter table public.deals add column if not exists city text;
alter table public.deals add column if not exists featured boolean not null default false;
alter table public.deals add column if not exists status text not null default 'draft';
alter table public.deals add column if not exists updated_at timestamptz not null default now();

-- Keep old `published` field compatible with the new status field.
create or replace function public.sync_deal_publish_status()
returns trigger language plpgsql as $$
begin
  new.published := (new.status = 'published');
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists sync_deal_publish_status_trigger on public.deals;
create trigger sync_deal_publish_status_trigger
before insert or update on public.deals
for each row execute function public.sync_deal_publish_status();

-- Public media bucket for offer images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('offer-media','offer-media',true,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true;

-- Anyone can view public offer media.
drop policy if exists "Public can view offer media" on storage.objects;
create policy "Public can view offer media"
on storage.objects for select
to public
using (bucket_id = 'offer-media');

-- Only NAPS admins/editors can upload, update or delete offer media.
drop policy if exists "NAPS admins can upload offer media" on storage.objects;
create policy "NAPS admins can upload offer media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'offer-media' and (select public.is_naps_admin()));

drop policy if exists "NAPS admins can update offer media" on storage.objects;
create policy "NAPS admins can update offer media"
on storage.objects for update
to authenticated
using (bucket_id = 'offer-media' and (select public.is_naps_admin()))
with check (bucket_id = 'offer-media' and (select public.is_naps_admin()));

drop policy if exists "NAPS admins can delete offer media" on storage.objects;
create policy "NAPS admins can delete offer media"
on storage.objects for delete
to authenticated
using (bucket_id = 'offer-media' and (select public.is_naps_admin()));

create index if not exists deals_status_dates_idx on public.deals(status,start_at,end_at);
create index if not exists deals_offer_type_idx on public.deals(offer_type);
