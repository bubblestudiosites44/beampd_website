-- 06_supabase_auth_and_rls.sql
-- Purpose:
-- 1) Move plugin auth to Supabase Auth-backed identities
-- 2) Lock down plugin tables with Row Level Security (RLS)
-- 3) Keep beampd_download policies unchanged (per project request)
--
-- Run this AFTER:
-- 00_supabase_extensions_and_helpers.sql
-- 01_plugin_account.sql
-- 02_plugin.sql
-- 03_plugin_review.sql
-- 04_beampd_download.sql
-- 05_storage_uploads_bucket.sql (if using uploads)

begin;

--------------------------------------------------------------------------------
-- A) plugin_account: attach rows to auth.users identities
--------------------------------------------------------------------------------

-- Keep legacy columns for now, but stop relying on password_hash.
alter table public.plugin_account
  add column if not exists auth_user_id uuid;

alter table public.plugin_account
  alter column password_hash drop not null;

create unique index if not exists idx_plugin_account_auth_user_id
  on public.plugin_account (auth_user_id)
  where auth_user_id is not null;

do $$
begin
  alter table public.plugin_account
    add constraint plugin_account_auth_user_id_fkey
    foreign key (auth_user_id)
    references auth.users (id)
    on delete cascade;
exception
  when duplicate_object then null;
end
$$;

-- Optional backfill: if existing plugin_account emails match auth.users emails.
update public.plugin_account pa
set auth_user_id = au.id
from auth.users au
where pa.auth_user_id is null
  and lower(pa.email) = lower(au.email);

-- Auto-create/update plugin_account row when a Supabase Auth user is created.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_username text;
  existing_account_id uuid;
  existing_owned_account_id uuid;
  safe_email text;
begin
  safe_email := nullif(trim(coalesce(new.email, '')), '');
  if safe_email is null then
    safe_email := 'user_' || substr(new.id::text, 1, 8) || '@local.invalid';
  end if;

  desired_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');

  if desired_username is null then
    desired_username := split_part(safe_email, '@', 1);
  end if;

  if desired_username is null or desired_username = '' then
    desired_username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  -- If a row already belongs to this auth user, keep it in sync.
  select pa.id
  into existing_owned_account_id
  from public.plugin_account pa
  where pa.auth_user_id = new.id
  limit 1;

  if existing_owned_account_id is not null then
    update public.plugin_account
    set
      username = coalesce(nullif(trim(username), ''), desired_username),
      email = safe_email,
      updated_date = now()
    where id = existing_owned_account_id;

    return new;
  end if;

  if exists (
    select 1
    from public.plugin_account
    where username = desired_username
      and auth_user_id is distinct from new.id
  ) then
    desired_username := desired_username || '_' || substr(new.id::text, 1, 6);
  end if;

  -- If a legacy row already exists for this email, attach it to the auth user
  -- instead of trying to insert a duplicate email/username row.
  select pa.id
  into existing_account_id
  from public.plugin_account pa
  where lower(pa.email) = lower(safe_email)
  limit 1;

  if existing_account_id is not null then
    update public.plugin_account
    set
      auth_user_id = new.id,
      email = safe_email,
      updated_date = now()
    where id = existing_account_id;

    return new;
  end if;

  insert into public.plugin_account (
    username,
    email,
    password_hash,
    auth_user_id
  )
  values (
    desired_username,
    safe_email,
    '',
    new.id
  )
  on conflict (auth_user_id) do update
  set
    email = safe_email,
    updated_date = now();

  return new;
exception
  when unique_violation then
    -- Last-resort fallback that guarantees a unique username per auth user.
    insert into public.plugin_account (
      username,
      email,
      password_hash,
      auth_user_id
    )
    values (
      'user_' || replace(substr(new.id::text, 1, 12), '-', ''),
      safe_email,
      '',
      new.id
    )
    on conflict (auth_user_id) do update
    set
      email = safe_email,
      updated_date = now();

    return new;
  when others then
    -- Do not block auth signup if profile sync fails; app can self-heal profile later.
    raise warning 'handle_new_auth_user failed for auth user %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_auth_user();

--------------------------------------------------------------------------------
-- B) plugin_account RLS
--------------------------------------------------------------------------------

alter table public.plugin_account enable row level security;
alter table public.plugin_account force row level security;

drop policy if exists plugin_account_select_own on public.plugin_account;
create policy plugin_account_select_own
on public.plugin_account
for select
to authenticated
using (auth_user_id = auth.uid());

drop policy if exists plugin_account_insert_own on public.plugin_account;
create policy plugin_account_insert_own
on public.plugin_account
for insert
to authenticated
with check (auth_user_id = auth.uid());

drop policy if exists plugin_account_update_own on public.plugin_account;
create policy plugin_account_update_own
on public.plugin_account
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

-- Allow internal auth-system writes used during signup trigger flows.
drop policy if exists plugin_account_insert_system on public.plugin_account;
create policy plugin_account_insert_system
on public.plugin_account
for insert
to service_role, supabase_auth_admin
with check (true);

drop policy if exists plugin_account_update_system on public.plugin_account;
create policy plugin_account_update_system
on public.plugin_account
for update
to service_role, supabase_auth_admin
using (true)
with check (true);

-- Username -> email resolver for login UX ("username OR email").
create or replace function public.resolve_plugin_login_email(p_identifier text)
returns text
language sql
security definer
set search_path = public
as $$
  select pa.email
  from public.plugin_account pa
  where lower(pa.username) = lower(trim(p_identifier))
     or lower(pa.email) = lower(trim(p_identifier))
  order by pa.created_date asc
  limit 1
$$;

revoke all on function public.resolve_plugin_login_email(text) from public;
grant execute on function public.resolve_plugin_login_email(text) to anon, authenticated;

--------------------------------------------------------------------------------
-- C) plugin RLS
--------------------------------------------------------------------------------

alter table public.plugin enable row level security;
alter table public.plugin force row level security;

drop policy if exists plugin_select_public_or_owner on public.plugin;
create policy plugin_select_public_or_owner
on public.plugin
for select
to anon, authenticated
using (
  is_public
  or exists (
    select 1
    from public.plugin_account pa
    where pa.id = plugin.author_account_id
      and pa.auth_user_id = auth.uid()
  )
);

drop policy if exists plugin_insert_owner on public.plugin;
create policy plugin_insert_owner
on public.plugin
for insert
to authenticated
with check (
  exists (
    select 1
    from public.plugin_account pa
    where pa.id = plugin.author_account_id
      and pa.auth_user_id = auth.uid()
  )
);

drop policy if exists plugin_update_owner on public.plugin;
create policy plugin_update_owner
on public.plugin
for update
to authenticated
using (
  exists (
    select 1
    from public.plugin_account pa
    where pa.id = plugin.author_account_id
      and pa.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.plugin_account pa
    where pa.id = plugin.author_account_id
      and pa.auth_user_id = auth.uid()
  )
);

drop policy if exists plugin_delete_owner on public.plugin;
create policy plugin_delete_owner
on public.plugin
for delete
to authenticated
using (
  exists (
    select 1
    from public.plugin_account pa
    where pa.id = plugin.author_account_id
      and pa.auth_user_id = auth.uid()
  )
);

--------------------------------------------------------------------------------
-- D) plugin_review: tie each review to auth user for ownership policies
--------------------------------------------------------------------------------

alter table public.plugin_review
  add column if not exists reviewer_account_id uuid;

do $$
begin
  alter table public.plugin_review
    add constraint plugin_review_reviewer_account_id_fkey
    foreign key (reviewer_account_id)
    references auth.users (id)
    on delete set null;
exception
  when duplicate_object then null;
end
$$;

create unique index if not exists idx_plugin_review_plugin_reviewer_unique
  on public.plugin_review (plugin_id, reviewer_account_id)
  where reviewer_account_id is not null;

alter table public.plugin_review enable row level security;
alter table public.plugin_review force row level security;

drop policy if exists plugin_review_select_public_or_owner on public.plugin_review;
create policy plugin_review_select_public_or_owner
on public.plugin_review
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.plugin p
    where p.id = plugin_review.plugin_id
      and p.is_public = true
  )
  or exists (
    select 1
    from public.plugin p
    join public.plugin_account pa on pa.id = p.author_account_id
    where p.id = plugin_review.plugin_id
      and pa.auth_user_id = auth.uid()
  )
);

drop policy if exists plugin_review_insert_authenticated on public.plugin_review;
create policy plugin_review_insert_authenticated
on public.plugin_review
for insert
to authenticated
with check (
  reviewer_account_id = auth.uid()
  and exists (
    select 1
    from public.plugin p
    where p.id = plugin_review.plugin_id
      and p.is_public = true
  )
);

drop policy if exists plugin_review_update_own on public.plugin_review;
create policy plugin_review_update_own
on public.plugin_review
for update
to authenticated
using (reviewer_account_id = auth.uid())
with check (reviewer_account_id = auth.uid());

drop policy if exists plugin_review_delete_own_or_plugin_owner on public.plugin_review;
create policy plugin_review_delete_own_or_plugin_owner
on public.plugin_review
for delete
to authenticated
using (
  reviewer_account_id = auth.uid()
  or exists (
    select 1
    from public.plugin p
    join public.plugin_account pa on pa.id = p.author_account_id
    where p.id = plugin_review.plugin_id
      and pa.auth_user_id = auth.uid()
  )
);

--------------------------------------------------------------------------------
-- E) IMPORTANT: leave public.beampd_download policies as-is
--------------------------------------------------------------------------------
-- No statements for public.beampd_download in this migration by design.

commit;
