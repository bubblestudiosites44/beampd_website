-- 08_forum_reply.sql
-- Purpose: Add replies to forum threads with public reads and owner-only writes.
-- Run this AFTER 07_forum_post.sql.

begin;

create table if not exists public.forum_reply (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  post_id uuid not null references public.forum_post(id) on delete cascade,
  content text not null,
  author_account_id uuid not null references public.plugin_account(id) on delete cascade,
  author_auth_user_id uuid not null references auth.users(id) on delete cascade,
  author_username text not null
);

create index if not exists idx_forum_reply_post_created_date
  on public.forum_reply (post_id, created_date);

create index if not exists idx_forum_reply_author_account_id
  on public.forum_reply (author_account_id);

create index if not exists idx_forum_reply_author_auth_user_id
  on public.forum_reply (author_auth_user_id);

alter table public.forum_reply
  drop constraint if exists forum_reply_content_len_chk;

alter table public.forum_reply
  add constraint forum_reply_content_len_chk
  check (char_length(trim(content)) between 2 and 10000);

drop trigger if exists trg_forum_reply_set_updated_date on public.forum_reply;
create trigger trg_forum_reply_set_updated_date
before update on public.forum_reply
for each row
execute function public.set_updated_date();

grant select on table public.forum_reply to anon;
grant select, insert, update, delete on table public.forum_reply to authenticated;

alter table public.forum_reply enable row level security;
alter table public.forum_reply force row level security;

drop policy if exists forum_reply_select_all on public.forum_reply;
create policy forum_reply_select_all
on public.forum_reply
for select
to anon, authenticated
using (true);

drop policy if exists forum_reply_insert_authenticated_owner on public.forum_reply;
create policy forum_reply_insert_authenticated_owner
on public.forum_reply
for insert
to authenticated
with check (
  author_auth_user_id = (select auth.uid())
  and exists (
    select 1
    from public.plugin_account pa
    where pa.id = forum_reply.author_account_id
      and pa.auth_user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.forum_post fp
    where fp.id = forum_reply.post_id
      and fp.is_locked = false
  )
);

drop policy if exists forum_reply_update_own on public.forum_reply;
create policy forum_reply_update_own
on public.forum_reply
for update
to authenticated
using (author_auth_user_id = (select auth.uid()))
with check (
  author_auth_user_id = (select auth.uid())
  and exists (
    select 1
    from public.plugin_account pa
    where pa.id = forum_reply.author_account_id
      and pa.auth_user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.forum_post fp
    where fp.id = forum_reply.post_id
      and fp.is_locked = false
  )
);

drop policy if exists forum_reply_delete_own on public.forum_reply;
create policy forum_reply_delete_own
on public.forum_reply
for delete
to authenticated
using (author_auth_user_id = (select auth.uid()));

commit;
