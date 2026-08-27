-- Ask Deal: multiple offer photos
alter table public.deals
  add column if not exists gallery_images jsonb not null default '[]'::jsonb;

comment on column public.deals.gallery_images is 'Additional offer image URLs. image_url remains the featured/first image.';