/*
  # Remove Auto-Confirmation and Require Email Verification

  ## Changes Made
  
  1. **Update parent registration trigger**
     - Remove auto email_confirmed = true
     - Set email_confirmed based on actual Supabase auth status
     - Parents must verify email before full account activation
  
  2. **Email Verification Flow**
     - Parent registers → receives confirmation email
     - Parent clicks link in email → email_confirmed_at is set
     - Trigger updates parents.email_confirmed = true
     - Parent can now login
  
  ## Important
  - Supabase SMTP must be configured in Dashboard
  - Go to: Authentication > Settings > Email Templates
  - Configure: SMTP settings or use Supabase's default email service
  - Enable: "Confirm email" toggle in Auth settings
*/

-- Update trigger to respect actual email confirmation status
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
      NEW.email_confirmed_at IS NOT NULL  -- Only true if email is actually confirmed
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

-- Email confirmation trigger remains the same
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  -- Update parents table when email is confirmed
  IF EXISTS (SELECT 1 FROM public.parents WHERE id = NEW.id) THEN
    UPDATE public.parents
    SET 
      email_confirmed = NEW.email_confirmed_at IS NOT NULL,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;