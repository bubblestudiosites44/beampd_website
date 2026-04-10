create table if not exists public.plugin_account (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  username text not null unique,
  email text not null unique,
  password_hash text not null
);

drop trigger if exists trg_plugin_account_set_updated_date on public.plugin_account;
create trigger trg_plugin_account_set_updated_date
before update on public.plugin_account
for each row
execute function public.set_updated_date();

