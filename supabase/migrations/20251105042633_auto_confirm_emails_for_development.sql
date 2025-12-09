/*
  # Auto-Confirm Emails for Development

  1. Issue
    - Emails not being sent during development
    - Users can't confirm their emails
    - Parents/admins can't complete registration

  2. Solution
    - Update trigger to auto-confirm emails on signup
    - Set email_confirmed = true immediately
    - This is for development only - disable in production

  3. Note
    - In production, configure SMTP in Supabase Dashboard
    - Or manually confirm emails via Dashboard
*/

-- Update the trigger to auto-confirm emails
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
      true  -- Auto-confirm for development
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email_confirmed = true,  -- Auto-confirm
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

-- Also update the email confirmation trigger to always set true
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  -- Update parents table when email is confirmed
  IF EXISTS (SELECT 1 FROM public.parents WHERE id = NEW.id) THEN
    UPDATE public.parents
    SET 
      email_confirmed = true,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
