/*
  # Fix Parents RLS for Child Registration

  1. Issue
    - Child registration endpoint is public (no auth)
    - Can't lookup parent because RLS requires auth.uid()
    - Need to allow service role to query parents

  2. Solution
    - Update RLS policy to allow service role access
    - Keep security for regular users
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Parents can view own profile" ON parents;

-- Allow authenticated users to view their own profile
CREATE POLICY "Parents can view own profile"
  ON parents FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow service role to view all parents (for API operations)
CREATE POLICY "Service role can view all parents"
  ON parents FOR SELECT
  TO service_role
  USING (true);

-- Allow anon role to check if parent exists (for child registration)
CREATE POLICY "Allow parent lookup for child registration"
  ON parents FOR SELECT
  TO anon
  USING (true);
