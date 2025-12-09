/*
  # Restructure Application - Step 3a: Drop parent_notifications policies

  ## Changes
  - Drop all policies on parent_notifications table
*/

DROP POLICY IF EXISTS "Allow service to insert notifications" ON parent_notifications;
DROP POLICY IF EXISTS "Parents can update own notifications" ON parent_notifications;
DROP POLICY IF EXISTS "Parents can view own notifications" ON parent_notifications;