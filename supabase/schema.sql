-- Supabase schema for Legue e Leozinho.
-- Run this in the Supabase SQL editor before enabling the frontend config.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'love-photos',
  'love-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  memory_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  storage_path text not null,
  public_url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  api_id text,
  imdb_id text,
  title text not null,
  release_year text,
  poster_url text,
  genre text,
  runtime text,
  plot text,
  watched_at date,
  created_at timestamptz not null default now()
);

create unique index if not exists movies_api_id_unique
on public.movies(api_id)
where api_id is not null and api_id <> '';

create table if not exists public.movie_ratings (
  movie_id uuid not null references public.movies(id) on delete cascade,
  person_slug text not null check (person_slug in ('legue', 'leozinho')),
  rating numeric check (rating >= 0 and rating <= 10),
  observation text,
  updated_at timestamptz not null default now(),
  primary key (movie_id, person_slug)
);

create table if not exists public.profiles (
  slug text primary key check (slug in ('legue', 'leozinho')),
  display_name text not null,
  description text,
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_slug text not null references public.profiles(slug) on delete cascade,
  storage_path text not null,
  public_url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_attributes (
  id uuid primary key default gen_random_uuid(),
  profile_slug text not null references public.profiles(slug) on delete cascade,
  name text not null,
  value integer not null check (value >= 1 and value <= 20),
  base_color text not null default '#7ec8e3',
  display_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (profile_slug, name)
);

insert into public.profiles (slug, display_name)
values ('legue', 'Legué'), ('leozinho', 'Leozinho')
on conflict (slug) do nothing;

insert into public.profile_attributes (profile_slug, name, value, base_color, display_order)
values
  ('legue', 'Beleza', 7, '#fe8ce4', 1),
  ('legue', 'Coberto com a Razão', 4, '#8cc8e4', 2),
  ('legue', 'Romântico', 12, '#6cc484', 3),
  ('leozinho', 'Beleza', 7, '#fe8ce4', 1),
  ('leozinho', 'Coberto com a Razão', 4, '#8cc8e4', 2),
  ('leozinho', 'Romântico', 12, '#6cc484', 3)
on conflict (profile_slug, name) do nothing;

create index if not exists memories_memory_date_idx on public.memories(memory_date desc);
create index if not exists memory_photos_memory_id_idx on public.memory_photos(memory_id);
create index if not exists movies_created_at_idx on public.movies(created_at desc);
create index if not exists movie_ratings_movie_id_idx on public.movie_ratings(movie_id);
create index if not exists profile_attributes_slug_order_idx on public.profile_attributes(profile_slug, display_order);
create index if not exists profile_photos_slug_order_idx on public.profile_photos(profile_slug, display_order);

alter table public.memories enable row level security;
alter table public.memory_photos enable row level security;
alter table public.movies enable row level security;
alter table public.movie_ratings enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.profile_attributes enable row level security;

drop policy if exists "public read memories" on public.memories;
drop policy if exists "public insert memories" on public.memories;
drop policy if exists "public update memories" on public.memories;
drop policy if exists "public delete memories" on public.memories;
create policy "public read memories" on public.memories for select using (true);
create policy "public insert memories" on public.memories for insert with check (true);
create policy "public update memories" on public.memories for update using (true) with check (true);
create policy "public delete memories" on public.memories for delete using (true);

drop policy if exists "public read memory photos" on public.memory_photos;
drop policy if exists "public insert memory photos" on public.memory_photos;
drop policy if exists "public update memory photos" on public.memory_photos;
drop policy if exists "public delete memory photos" on public.memory_photos;
create policy "public read memory photos" on public.memory_photos for select using (true);
create policy "public insert memory photos" on public.memory_photos for insert with check (true);
create policy "public update memory photos" on public.memory_photos for update using (true) with check (true);
create policy "public delete memory photos" on public.memory_photos for delete using (true);

drop policy if exists "public read movies" on public.movies;
drop policy if exists "public insert movies" on public.movies;
drop policy if exists "public update movies" on public.movies;
drop policy if exists "public delete movies" on public.movies;
create policy "public read movies" on public.movies for select using (true);
create policy "public insert movies" on public.movies for insert with check (true);
create policy "public update movies" on public.movies for update using (true) with check (true);
create policy "public delete movies" on public.movies for delete using (true);

drop policy if exists "public read movie ratings" on public.movie_ratings;
drop policy if exists "public insert movie ratings" on public.movie_ratings;
drop policy if exists "public update movie ratings" on public.movie_ratings;
drop policy if exists "public delete movie ratings" on public.movie_ratings;
create policy "public read movie ratings" on public.movie_ratings for select using (true);
create policy "public insert movie ratings" on public.movie_ratings for insert with check (true);
create policy "public update movie ratings" on public.movie_ratings for update using (true) with check (true);
create policy "public delete movie ratings" on public.movie_ratings for delete using (true);

drop policy if exists "public read profiles" on public.profiles;
drop policy if exists "public update profiles" on public.profiles;
create policy "public read profiles" on public.profiles for select using (true);
create policy "public update profiles" on public.profiles for update using (true) with check (true);

drop policy if exists "public read profile photos" on public.profile_photos;
drop policy if exists "public insert profile photos" on public.profile_photos;
drop policy if exists "public update profile photos" on public.profile_photos;
drop policy if exists "public delete profile photos" on public.profile_photos;
create policy "public read profile photos" on public.profile_photos for select using (true);
create policy "public insert profile photos" on public.profile_photos for insert with check (true);
create policy "public update profile photos" on public.profile_photos for update using (true) with check (true);
create policy "public delete profile photos" on public.profile_photos for delete using (true);

drop policy if exists "public read profile attributes" on public.profile_attributes;
drop policy if exists "public insert profile attributes" on public.profile_attributes;
drop policy if exists "public update profile attributes" on public.profile_attributes;
drop policy if exists "public delete profile attributes" on public.profile_attributes;
create policy "public read profile attributes" on public.profile_attributes for select using (true);
create policy "public insert profile attributes" on public.profile_attributes for insert with check (true);
create policy "public update profile attributes" on public.profile_attributes for update using (true) with check (true);
create policy "public delete profile attributes" on public.profile_attributes for delete using (true);

drop policy if exists "public read love photos" on storage.objects;
create policy "public read love photos"
on storage.objects for select
using (bucket_id = 'love-photos');

drop policy if exists "public insert love photos" on storage.objects;
create policy "public insert love photos"
on storage.objects for insert
with check (bucket_id = 'love-photos');

drop policy if exists "public update love photos" on storage.objects;
create policy "public update love photos"
on storage.objects for update
using (bucket_id = 'love-photos')
with check (bucket_id = 'love-photos');

drop policy if exists "public delete love photos" on storage.objects;
create policy "public delete love photos"
on storage.objects for delete
using (bucket_id = 'love-photos');
