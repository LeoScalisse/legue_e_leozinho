delete from public.profile_photos
where profile_slug = 'legue';

insert into public.profile_photos (profile_slug, storage_path, display_order)
values
  ('legue', 'profile/legue/legue-1.jpeg', 1),
  ('legue', 'profile/legue/legue-2.jpeg', 2),
  ('legue', 'profile/legue/legue-3.jpeg', 3),
  ('legue', 'profile/legue/legue-4.jpeg', 4);
