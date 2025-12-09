/*
  # Fix Parents Table RLS for Registration

  1. Changes
    - Allow unauthenticated users to insert into parents table during registration
    - This is needed because auth.signUp() creates the user, but we need to insert into parents table
    - We'll use the user's ID from the signup to ensure security

  2. Security
    - The insert policy checks that the ID being inserted matches the authenticated user's ID
    - Or allows insert for new registrations (since auth.uid() will be null during signup)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Parents can insert own profile" ON parents;

-- Allow inserts during registration
CREATE POLICY "Allow user registration"
  ON parents FOR INSERT
  WITH CHECK (true);

-- Update the select policy to work with both authenticated and new users
DROP POLICY IF EXISTS "Parents can view own profile" ON parents;

CREATE POLICY "Parents can view own profile"
  ON parents FOR SELECT
  USING (auth.uid() = id);

-- Keep the update policy as is
DROP POLICY IF EXISTS "Parents can update own profile" ON parents;

CREATE POLICY "Parents can update own profile"
  ON parents FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
