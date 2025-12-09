/*
  # Add Storage Policies for File Uploads
  
  Drop existing policies and recreate to allow authenticated uploads.
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated uploads to sfx" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from sfx" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to animations" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from animations" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to lesson-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from lesson-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to shareables" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from shareables" ON storage.objects;

-- Create new policies
CREATE POLICY "Allow authenticated uploads to sfx"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'sfx');

CREATE POLICY "Allow public reads from sfx"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'sfx');

CREATE POLICY "Allow authenticated uploads to animations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'animations');

CREATE POLICY "Allow public reads from animations"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'animations');

CREATE POLICY "Allow authenticated uploads to lesson-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lesson-assets');

CREATE POLICY "Allow public reads from lesson-assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-assets');

CREATE POLICY "Allow authenticated uploads to avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public reads from avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated uploads to backgrounds"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'backgrounds');

CREATE POLICY "Allow public reads from backgrounds"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'backgrounds');

CREATE POLICY "Allow authenticated uploads to shareables"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'shareables');

CREATE POLICY "Allow public reads from shareables"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'shareables');
