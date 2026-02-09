-- 1. Ensure the image_url column exists in items table
alter table items add column if not exists image_url text;

-- 2. Create the Storage Bucket for images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-images', 'item-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
on conflict (id) do nothing;

-- 3. Set up Security Policies for the Bucket

-- Allow public access to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'item-images' );

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'item-images' 
    and auth.role() = 'authenticated'
  );

-- Allow users to update/delete their own images
create policy "Users can update own images"
  on storage.objects for update
  using ( bucket_id = 'item-images' and owner = auth.uid() );

create policy "Users can delete own images"
  on storage.objects for delete
  using ( bucket_id = 'item-images' and owner = auth.uid() );
