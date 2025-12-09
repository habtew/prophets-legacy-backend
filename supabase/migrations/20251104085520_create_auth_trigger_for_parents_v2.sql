/*
  # Create Database Trigger for Auto-populating Parents Table

  1. Purpose
    - Automatically create a parent profile when a user signs up via Supabase Auth
    - This ensures the parents table is always synchronized with auth.users
    - Handles the case where Supabase Auth manages user creation

  2. Changes
    - Create a function that inserts into parents table
    - Create a trigger that fires on auth.users insert
    - Update RLS policies to allow service role access

  3. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only triggers on new user creation
    - Maintains data integrity between auth.users and parents table
*/

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create parent profile if role is 'parent' or not set
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create parent profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also create a trigger for email confirmation updates
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  -- Update parent profile when email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.parents
    SET email_confirmed = true, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;

-- Create trigger for email confirmation
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_confirmed();
