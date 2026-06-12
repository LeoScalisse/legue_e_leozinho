create table if not exists public.love_mural_captions (
  file_name text primary key,
  title text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.love_mural_captions
add column if not exists title text not null default '';

create index if not exists love_mural_captions_updated_idx on public.love_mural_captions(updated_at desc);

alter table public.love_mural_captions enable row level security;

drop policy if exists "public read love mural captions" on public.love_mural_captions;
drop policy if exists "public insert love mural captions" on public.love_mural_captions;
drop policy if exists "public update love mural captions" on public.love_mural_captions;
drop policy if exists "public delete love mural captions" on public.love_mural_captions;
create policy "public read love mural captions" on public.love_mural_captions for select using (true);
create policy "public insert love mural captions" on public.love_mural_captions for insert with check (true);
create policy "public update love mural captions" on public.love_mural_captions for update using (true) with check (true);
create policy "public delete love mural captions" on public.love_mural_captions for delete using (true);
