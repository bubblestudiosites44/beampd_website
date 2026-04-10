create table if not exists public.plugin (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  name text not null,
  category text not null check (
    category in (
      'Callout Pack',
      'Vehicle Pack',
      'Map Add-on',
      'Sound Pack',
      'UI Skin',
      'Script & Logic',
      'Other'
    )
  ),
  author text not null,
  author_account_id uuid references public.plugin_account(id) on delete set null,
  version text not null,
  description text not null,
  long_description text,
  download_url text,
  image_url text,
  file_size text,
  beamng_version text,
  beampd_version text,
  tags text[] not null default '{}',
  downloads integer not null default 0 check (downloads >= 0),
  views integer not null default 0 check (views >= 0),
  rating numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  is_public boolean not null default true
);

create index if not exists idx_plugin_public_created_date
  on public.plugin (is_public, created_date desc);

create index if not exists idx_plugin_category
  on public.plugin (category);

create index if not exists idx_plugin_author_account_id
  on public.plugin (author_account_id);

drop trigger if exists trg_plugin_set_updated_date on public.plugin;
create trigger trg_plugin_set_updated_date
before update on public.plugin
for each row
execute function public.set_updated_date();

