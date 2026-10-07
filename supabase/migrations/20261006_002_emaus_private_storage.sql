-- EMAÚS · FASE 3.14
-- Storage privado para fotografías.
-- No crea URLs públicas ni secretos.

begin;

alter table public.memories
  add column if not exists media_mime_type text,
  add column if not exists media_size_bytes bigint
    check (media_size_bytes is null or media_size_bytes >= 0);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'emaus-private',
  'emaus-private',
  false,
  15728640,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists emaus_storage_select_own on storage.objects;
create policy emaus_storage_select_own
on storage.objects
for select
to authenticated
using (
  bucket_id = 'emaus-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists emaus_storage_insert_own on storage.objects;
create policy emaus_storage_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'emaus-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists emaus_storage_update_own on storage.objects;
create policy emaus_storage_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'emaus-private'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'emaus-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists emaus_storage_delete_own on storage.objects;
create policy emaus_storage_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'emaus-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;
