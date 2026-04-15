-- 07_forum_post.sql
-- Purpose:
-- Create a forum_post table and enforce authenticated account ownership for posting.
--
-- Run this AFTER:
-- 00_supabase_extensions_and_helpers.sql
-- 01_plugin_account.sql
-- 06_supabase_auth_and_rls.sql

begin;

create table if not exists public.forum_post (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  title text not null,
  content text not null,
  category text not null default 'General',
  author_account_id uuid not null references public.plugin_account(id) on delete cascade,
  author_auth_user_id uuid not null references auth.users(id) on delete cascade,
  author_username text not null,
  is_locked boolean not null default false
);

create index if not exists idx_forum_post_created_date on public.forum_post (created_date desc);
create index if not exists idx_forum_post_category on public.forum_post (category);
create index if not exists idx_forum_post_author_account_id on public.forum_post (author_account_id);

alter table public.forum_post
  drop constraint if exists forum_post_title_len_chk;

alter table public.forum_post
  add constraint forum_post_title_len_chk
  check (char_length(trim(title)) between 4 and 140);

alter table public.forum_post
  drop constraint if exists forum_post_content_len_chk;

alter table public.forum_post
  add constraint forum_post_content_len_chk
  check (char_length(trim(content)) between 8 and 10000);

drop trigger if exists trg_forum_post_set_updated_date on public.forum_post;
create trigger trg_forum_post_set_updated_date
before update on public.forum_post
for each row
execute function public.set_updated_date();

alter table public.forum_post enable row level security;
alter table public.forum_post force row level security;

drop policy if exists forum_post_select_all on public.forum_post;
create policy forum_post_select_all
on public.forum_post
for select
to anon, authenticated
using (true);

drop policy if exists forum_post_insert_authenticated_owner on public.forum_post;
create policy forum_post_insert_authenticated_owner
on public.forum_post
for insert
to authenticated
with check (
  is_locked = false
  and author_auth_user_id = auth.uid()
  and exists (
    select 1
    from public.plugin_account pa
    where pa.id = forum_post.author_account_id
      and pa.auth_user_id = auth.uid()
  )
);

drop policy if exists forum_post_update_own on public.forum_post;
create policy forum_post_update_own
on public.forum_post
for update
to authenticated
using (
  author_auth_user_id = auth.uid()
  and exists (
    select 1
    from public.plugin_account pa
    where pa.id = forum_post.author_account_id
      and pa.auth_user_id = auth.uid()
  )
)
with check (
  author_auth_user_id = auth.uid()
  and exists (
    select 1
    from public.plugin_account pa
    where pa.id = forum_post.author_account_id
      and pa.auth_user_id = auth.uid()
  )
);

drop policy if exists forum_post_delete_own on public.forum_post;
create policy forum_post_delete_own
on public.forum_post
for delete
to authenticated
using (
  author_auth_user_id = auth.uid()
  and exists (
    select 1
    from public.plugin_account pa
    where pa.id = forum_post.author_account_id
      and pa.auth_user_id = auth.uid()
  )
);

commit;
