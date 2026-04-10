create table if not exists public.plugin_review (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  plugin_id uuid not null references public.plugin(id) on delete cascade,
  reviewer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text
);

create index if not exists idx_plugin_review_plugin_id_created_date
  on public.plugin_review (plugin_id, created_date desc);

drop trigger if exists trg_plugin_review_set_updated_date on public.plugin_review;
create trigger trg_plugin_review_set_updated_date
before update on public.plugin_review
for each row
execute function public.set_updated_date();

