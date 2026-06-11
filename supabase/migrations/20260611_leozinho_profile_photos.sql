delete from public.profile_photos
where profile_slug = 'leozinho';

insert into public.profile_photos (profile_slug, storage_path, display_order)
values
  ('leozinho', 'profile/leozinho/leozinho-1.jpeg', 1),
  ('leozinho', 'profile/leozinho/leozinho-2.jpeg', 2),
  ('leozinho', 'profile/leozinho/leozinho-3.jpeg', 3),
  ('leozinho', 'profile/leozinho/leozinho-4.jpeg', 4);
