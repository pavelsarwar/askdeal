create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings for select
using (true);

drop policy if exists "Authenticated users can manage site settings" on public.site_settings;
create policy "Authenticated users can manage site settings"
on public.site_settings for all to authenticated
using (true) with check (true);

grant select on public.site_settings to anon;
grant all on public.site_settings to authenticated;

insert into public.site_settings(key,value) values
('topbar_left','🇲🇾 Ask Deal for any Deal across Malaysia'),
('topbar_right','Updated daily · Local & national offers'),
('hero_title','Ask for a deal,'),
('hero_highlight','find a better one.'),
('hero_description','Discover nearby offers, promotions, promo codes, events and opportunities across Malaysia.'),
('footer_brand','Ask Deal'),
('footer_tagline','Ask Deal for any Deal'),
('social_facebook',''),
('social_instagram',''),
('social_linkedin',''),
('social_youtube',''),
('social_tiktok',''),
('social_x','')
on conflict (key) do nothing;