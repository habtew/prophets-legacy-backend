/*
  # Remove all parent_id references from RLS policies

  1. Changes
    - Drop old lesson_completions policies that reference parent_id
    - Create new simple policies without parent_id
    - Ensures no parent_id column references exist

  2. Security
    - Children can only access their own data
    - No parent_id checks needed since we removed parent concept
*/

-- Fix lesson_completions policies
DROP POLICY IF EXISTS "Children can view own completions" ON lesson_completions;
DROP POLICY IF EXISTS "Children can insert own completions" ON lesson_completions;

CREATE POLICY "Children can view own completions"
  ON lesson_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id);

CREATE POLICY "Children can insert own completions"
  ON lesson_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = child_id);
