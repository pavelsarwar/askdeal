-- Ask Deal: ensure every Merchant / Shop / Brand has a slug even if a client forgets to send one.
create or replace function public.ensure_merchant_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or btrim(new.slug) = '' then
    new.slug := regexp_replace(lower(coalesce(new.name,'merchant')), '[^a-z0-9]+', '-', 'g');
    new.slug := trim(both '-' from new.slug);
    if new.slug is null or new.slug = '' then
      new.slug := 'merchant';
    end if;
    new.slug := new.slug || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,8);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ensure_merchant_slug on public.merchants;
create trigger trg_ensure_merchant_slug
before insert on public.merchants
for each row execute function public.ensure_merchant_slug();
