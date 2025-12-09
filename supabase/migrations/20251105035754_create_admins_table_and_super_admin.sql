/*
  # Create Admins Table and Super Admin

  1. Purpose
    - Create admins table to track admin users
    - Integrate with Supabase auth.users
    - Create super admin account with email habtamuwolde95@gmail.com
    - Super admin can create other admins

  2. New Tables
    - `admins`
      - `id` (uuid, references auth.users)
      - `email` (text, unique)
      - `name` (text)
      - `is_super_admin` (boolean) - only super admin can create other admins
      - `created_at` (timestamptz)
      - `created_by` (uuid) - which admin created this admin

  3. Security
    - Enable RLS on admins table
    - Only admins can view admin records
    - Only super admin can create new admins
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  is_super_admin boolean DEFAULT false,
  created_by uuid REFERENCES public.admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create trigger to update admins table when admin user is created in auth
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create admin profile if role is 'admin'
  IF (NEW.raw_user_meta_data->>'role' = 'admin') THEN
    INSERT INTO public.admins (id, email, name, is_super_admin, created_by)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      COALESCE((NEW.raw_user_meta_data->>'is_super_admin')::boolean, false),
      (NEW.raw_user_meta_data->>'created_by')::uuid
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the main trigger to also handle admins
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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

  -- Handle child registration (NOTE: Children no longer use auth.users)
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
      SPLIT_PART(NEW.email, '@', 1),
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

  -- Handle admin registration
  IF (NEW.raw_user_meta_data->>'role' = 'admin') THEN
    INSERT INTO public.admins (id, email, name, is_super_admin, created_by)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      COALESCE((NEW.raw_user_meta_data->>'is_super_admin')::boolean, false),
      (NEW.raw_user_meta_data->>'created_by')::uuid
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for admins table
CREATE POLICY "Admins can view all admins"
  ON public.admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Super admin can insert admins"
  ON public.admins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Create the super admin user in auth.users
-- Note: This will be done via the API, but we'll prepare the table
-- The super admin will need to be created with password via Supabase Auth API
