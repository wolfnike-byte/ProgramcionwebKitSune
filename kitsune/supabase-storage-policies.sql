insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

create policy "Public can read menu images"
on storage.objects
for select
using (bucket_id = 'menu-images');

create policy "Authenticated admins can upload menu images"
on storage.objects
for insert
with check (
  bucket_id = 'menu-images'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = 'admin'
);

create policy "Authenticated admins can update menu images"
on storage.objects
for update
using (
  bucket_id = 'menu-images'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = 'admin'
)
with check (
  bucket_id = 'menu-images'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = 'admin'
);
