create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "Public can read Kitsune site content"
on public.site_content
for select
using (id = 'kitsune-admin-content');

create policy "Authenticated admins can update Kitsune site content"
on public.site_content
for insert
with check (auth.role() = 'authenticated' and id = 'kitsune-admin-content');

create policy "Authenticated admins can modify Kitsune site content"
on public.site_content
for update
using (auth.role() = 'authenticated' and id = 'kitsune-admin-content')
with check (auth.role() = 'authenticated' and id = 'kitsune-admin-content');
