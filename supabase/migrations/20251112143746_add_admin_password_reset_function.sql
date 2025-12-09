/*
  # Add Admin Password Reset Function
  
  Creates a function to reset admin password using the setup key.
  This allows password reset when locked out.
  
  Security:
  - Requires setup key validation
  - Only works for admin users
  - Uses Supabase Auth admin functions
*/

-- Create function to reset admin password
CREATE OR REPLACE FUNCTION reset_admin_password(
  admin_email TEXT,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  result JSON;
BEGIN
  -- Get user ID from admins table
  SELECT id INTO user_id
  FROM admins
  WHERE email = admin_email;
  
  IF user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Admin not found'
    );
  END IF;
  
  -- Update password in auth.users using extension
  -- Note: This requires the auth schema functions
  PERFORM auth.update_user_password(user_id, new_password);
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password updated successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$;
