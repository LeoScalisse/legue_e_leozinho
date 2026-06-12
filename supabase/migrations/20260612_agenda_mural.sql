create table if not exists public.love_agenda_events (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  title text,
  description text,
  start_time time not null,
  end_time time not null,
  color text not null default '#5fafd4',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table if not exists public.love_mural_items (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  public_url text,
  title text,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists love_agenda_events_date_idx on public.love_agenda_events(event_date, start_time);
create index if not exists love_mural_items_order_idx on public.love_mural_items(display_order, created_at desc);

alter table public.love_agenda_events enable row level security;
alter table public.love_mural_items enable row level security;

drop policy if exists "public read love agenda events" on public.love_agenda_events;
drop policy if exists "public insert love agenda events" on public.love_agenda_events;
drop policy if exists "public update love agenda events" on public.love_agenda_events;
drop policy if exists "public delete love agenda events" on public.love_agenda_events;
create policy "public read love agenda events" on public.love_agenda_events for select using (true);
create policy "public insert love agenda events" on public.love_agenda_events for insert with check (true);
create policy "public update love agenda events" on public.love_agenda_events for update using (true) with check (true);
create policy "public delete love agenda events" on public.love_agenda_events for delete using (true);

drop policy if exists "public read love mural items" on public.love_mural_items;
drop policy if exists "public insert love mural items" on public.love_mural_items;
drop policy if exists "public update love mural items" on public.love_mural_items;
drop policy if exists "public delete love mural items" on public.love_mural_items;
create policy "public read love mural items" on public.love_mural_items for select using (true);
create policy "public insert love mural items" on public.love_mural_items for insert with check (true);
create policy "public update love mural items" on public.love_mural_items for update using (true) with check (true);
create policy "public delete love mural items" on public.love_mural_items for delete using (true);
