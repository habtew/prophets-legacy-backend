/*
  # Update Auth Trigger - Remove Child Auth Creation

  1. Purpose
    - Children no longer use Supabase auth
    - Children use username-only login with custom JWT
    - Remove child handling from auth trigger

  2. Changes
    - Update handle_new_user() to only handle parents and admins
    - Children are created directly in children table without auth.users entry
*/

-- Update the trigger function to remove child handling
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
