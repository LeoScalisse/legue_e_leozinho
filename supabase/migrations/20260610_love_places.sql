create table if not exists public.love_places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  experience text not null,
  visited_at date,
  latitude numeric not null,
  longitude numeric not null,
  osm_id text,
  osm_type text,
  created_at timestamptz not null default now()
);

create index if not exists love_places_visited_at_idx on public.love_places(visited_at desc);

alter table public.love_places enable row level security;

drop policy if exists "public read love places" on public.love_places;
drop policy if exists "public insert love places" on public.love_places;
drop policy if exists "public update love places" on public.love_places;
drop policy if exists "public delete love places" on public.love_places;

create policy "public read love places" on public.love_places for select using (true);
create policy "public insert love places" on public.love_places for insert with check (true);
create policy "public update love places" on public.love_places for update using (true) with check (true);
create policy "public delete love places" on public.love_places for delete using (true);
