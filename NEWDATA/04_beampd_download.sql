create table if not exists public.beampd_download (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  label text not null,
  type text not null check (type in ('auto', 'manual')),
  version text not null,
  download_url text not null,
  file_name text,
  file_size text,
  changelog text,
  is_active boolean not null default true,
  coming_soon boolean not null default false
);

create index if not exists idx_beampd_download_active_type_created_date
  on public.beampd_download (is_active, type, created_date desc);

drop trigger if exists trg_beampd_download_set_updated_date on public.beampd_download;
create trigger trg_beampd_download_set_updated_date
before update on public.beampd_download
for each row
execute function public.set_updated_date();

