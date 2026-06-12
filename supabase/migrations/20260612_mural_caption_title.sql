alter table public.love_mural_captions
add column if not exists title text not null default '';
