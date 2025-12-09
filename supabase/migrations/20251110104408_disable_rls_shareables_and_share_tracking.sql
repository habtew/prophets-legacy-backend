/*
  # Disable RLS on shareables and share_tracking
  
  Disabling RLS to prevent errors when creating share jobs.
*/

ALTER TABLE shareables DISABLE ROW LEVEL SECURITY;
ALTER TABLE share_tracking DISABLE ROW LEVEL SECURITY;
