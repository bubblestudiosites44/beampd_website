-- Optional: required for plugin/image uploads from the frontend.
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Public read access to uploaded files.
drop policy if exists "uploads_public_read" on storage.objects;
create policy "uploads_public_read"
on storage.objects
for select
to public
using (bucket_id = 'uploads');

-- Allow client-side uploads with anon key.
drop policy if exists "uploads_public_insert" on storage.objects;
create policy "uploads_public_insert"
on storage.objects
for insert
to public
with check (bucket_id = 'uploads');

