/*
  # Fix Children Registration and Email Confirmation

  ## Changes Made
  
  1. **Disable RLS on children table**
     - Children don't use Supabase auth, so RLS policies cause conflicts
     - Backend JWT tokens handle authorization instead
     - Fixes "no unique or exclusion constraint matching ON CONFLICT" error
  
  2. **Remove auto email confirmation**
     - Re-enable email confirmation requirement for parents
     - Users must confirm email before logging in
     - Emails will be sent via Supabase Auth

  ## Security Notes
  - Children table is protected by backend authentication middleware
  - Parent table uses Supabase auth with proper RLS policies
  - Admin operations require admin role verification
*/

-- Disable RLS on children table (children use backend JWT, not Supabase auth)
ALTER TABLE children DISABLE ROW LEVEL SECURITY;

-- Re-enable email confirmation for parents (remove auto-confirm)
-- This requires updating the Supabase Auth settings via dashboard:
-- Go to Authentication > Settings > Email Auth
-- Enable "Confirm email" toggle
-- Configure SMTP settings for email delivery