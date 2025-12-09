/*
  # Create Database Trigger for Auto-populating Children Table

  1. Purpose
    - Automatically create a child profile when a user signs up via Supabase Auth with role 'child'
    - This ensures the children table is always synchronized with auth.users
    - Similar to parent trigger but for children

  2. Changes
    - Update the existing handle_new_user function to also handle children
    - Children don't need email confirmation
    - Children profiles are auto-confirmed

  3. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only triggers on new user creation with role 'child'
    - Maintains data integrity between auth.users and children table
*/

-- Update the function to handle both parents and children
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle parent registration
  IF (NEW.raw_user_meta_data->>'role' = 'parent' OR NEW.raw_user_meta_data->>'role' IS NULL) THEN
    INSERT INTO public.parents (id, email, name, phone, email_confirmed)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.raw_user_meta_data->>'phone',
      NEW.email_confirmed_at IS NOT NULL
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email_confirmed = NEW.email_confirmed_at IS NOT NULL,
      updated_at = NOW();
  END IF;

  -- Handle child registration
  IF (NEW.raw_user_meta_data->>'role' = 'child') THEN
    INSERT INTO public.children (
      id,
      parent_id,
      username,
      display_name,
      age_group,
      avatar_url
    )
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'parent_id')::uuid,
      SPLIT_PART(NEW.email, '@', 1),  -- Extract username from email
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'age_group',
      NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for children table to allow inserts via trigger
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Allow authenticated parents to view their children
DROP POLICY IF EXISTS "Parents can view their children" ON children;
CREATE POLICY "Parents can view their children"
  ON children FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid() OR id = auth.uid());

-- Allow children to view their own profile
DROP POLICY IF EXISTS "Children can view own profile" ON children;
CREATE POLICY "Children can view own profile"
  ON children FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow parents to update their children's profiles
DROP POLICY IF EXISTS "Parents can update their children" ON children;
CREATE POLICY "Parents can update their children"
  ON children FOR UPDATE
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Allow children to update their own profile
DROP POLICY IF EXISTS "Children can update own profile" ON children;
CREATE POLICY "Children can update own profile"
  ON children FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
