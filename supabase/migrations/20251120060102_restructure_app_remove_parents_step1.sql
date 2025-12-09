/*
  # Restructure Application - Step 1: Drop Policies and Constraints

  ## Changes
  - Drop all RLS policies that depend on parent_id
  - Drop foreign key constraints
  - Prepare for parent removal
*/

-- Drop all policies on children table that reference parent_id
DROP POLICY IF EXISTS "Parents can insert children" ON children;
DROP POLICY IF EXISTS "Children and parents can update profile" ON children;
DROP POLICY IF EXISTS "Parents can view their children" ON children;
DROP POLICY IF EXISTS "Parents can update their children" ON children;

-- Drop policies on related tables that reference parent_id
DROP POLICY IF EXISTS "Children can view own completions" ON lesson_completions;
DROP POLICY IF EXISTS "Children can view own attempt sessions" ON attempt_sessions;
DROP POLICY IF EXISTS "Children can view own achievements" ON child_achievements;

-- Drop foreign key constraints
ALTER TABLE children DROP CONSTRAINT IF EXISTS children_parent_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_parent_id_fkey;
ALTER TABLE parent_notifications DROP CONSTRAINT IF EXISTS parent_notifications_parent_id_fkey;
ALTER TABLE parent_notifications DROP CONSTRAINT IF EXISTS parent_notifications_child_id_fkey;