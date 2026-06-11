alter table public.memory_photos
add column if not exists media_type text not null default 'image'
check (media_type in ('image', 'video'));

update storage.buckets
set file_size_limit = 104857600,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4'
    ]
where id = 'love-photos';
