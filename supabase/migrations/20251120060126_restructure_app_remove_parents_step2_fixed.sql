/*
  # Restructure Application - Step 2: Drop More Policies

  ## Changes
  - Drop remaining policies on notifications
*/

-- Drop policies on notifications
DROP POLICY IF EXISTS "Parents can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Parents can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow authenticated users to read notifications" ON notifications;
DROP POLICY IF EXISTS "Allow authenticated users to update notifications" ON notifications;