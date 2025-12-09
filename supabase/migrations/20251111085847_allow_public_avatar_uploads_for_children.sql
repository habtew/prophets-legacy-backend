/*
  # Allow Public Avatar Uploads for Children

  ## Changes Made
  
  1. **Add public upload policy for avatars bucket**
     - Children don't use Supabase auth
     - Backend JWT validates requests instead
     - Allows uploads from public role with backend validation
  
  2. **Security Notes**
     - Backend endpoint validates child authentication
     - File size limits enforced at application level
     - Only image files allowed (validated by backend)
     - Public read access already enabled

  ## Why This Is Needed
  - Children use backend JWT, not Supabase auth tokens
  - Storage policies require auth or public role
  - Backend middleware ensures only authenticated children can upload
*/

-- Allow public uploads to avatars bucket (backend validates authentication)
CREATE POLICY "Allow public uploads to avatars"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

-- Allow public updates to avatars (for overwriting existing avatars)
CREATE POLICY "Allow public updates to avatars"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Allow public deletes from avatars (for cleanup)
CREATE POLICY "Allow public deletes from avatars"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'avatars');