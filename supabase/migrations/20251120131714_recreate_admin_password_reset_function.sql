/*
  # Recreate Admin Password Reset Function

  1. Drop existing function
  2. Create new function with correct return type
*/

-- Drop existing function if exists
DROP FUNCTION IF EXISTS reset_admin_password(TEXT, TEXT);

-- Create function to reset admin password
CREATE OR REPLACE FUNCTION reset_admin_password(
  admin_email TEXT,
  new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  result JSONB;
BEGIN
  -- Get user ID from email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = admin_email
  AND raw_user_meta_data->>'role' = 'admin';

  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Admin user not found'
    );
  END IF;

  -- Update password in auth.users
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Password updated successfully',
    'user_id', user_id
  );
END;
$$;
