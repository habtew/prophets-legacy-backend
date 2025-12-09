const supabase = require('../config/supabase');

/**
 * Register a new admin (only super admin can do this)
 */
const registerAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Verify that the requesting user is a super admin
    const requestingUserId = req.user.id;
    const { data: requestingAdmin, error: adminError } = await supabase
      .from('admins')
      .select('id, is_super_admin')
      .eq('id', requestingUserId)
      .maybeSingle();

    if (!requestingAdmin || !requestingAdmin.is_super_admin) {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can create new admin accounts'
      });
    }

    // Create admin user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'admin',
          is_super_admin: false,
          created_by: requestingUserId
        },
        emailRedirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/admin/confirm`
      }
    });

    if (error) {
      console.error('Admin signup error:', error);
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (!data.user) {
      return res.status(500).json({
        success: false,
        message: 'Admin creation failed'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully! They can now log in.',
      adminId: data.user.id,
      email: data.user.email,
      emailConfirmed: true
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Initialize super admin (one-time setup)
 * This should be called once to create the initial super admin
 */
const initializeSuperAdmin = async (req, res) => {
  try {
    const { email, password, name, setupKey } = req.body;

    // Security check: require a setup key from environment
    const validSetupKey = process.env.SUPER_ADMIN_SETUP_KEY || 'prophets-legacy-super-admin-2024';

    if (setupKey !== validSetupKey) {
      return res.status(403).json({
        success: false,
        message: 'Invalid setup key'
      });
    }

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Check if super admin already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin account with this email already exists'
      });
    }

    // Create super admin user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'admin',
          is_super_admin: true,
          created_by: null
        },
        emailRedirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/admin/confirm`
      }
    });

    if (error) {
      console.error('Super admin creation error:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (!data.user) {
      return res.status(500).json({
        success: false,
        message: 'Super admin creation failed'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Super admin account created successfully! You can now log in.',
      adminId: data.user.id,
      email: data.user.email,
      isSuperAdmin: true,
      emailConfirmed: true
    });
  } catch (error) {
    console.error('Super admin initialization error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Admin login
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    console.log('Admin login attempt for:', email);

    // Use Supabase Auth to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Admin login error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        email: email
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        details: error.message,
        hint: 'If you forgot your password, use POST /admin/auth/update-password with your email'
      });
    }

    if (!data.session || !data.user) {
      console.error('No session or user returned');
      return res.status(401).json({ success: false, message: 'Login failed - no session created' });
    }

    // Verify user is an admin by checking admins table
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, email, name, is_super_admin')
      .eq('id', data.user.id)
      .maybeSingle();

    if (adminError || !admin) {
      console.error('Admin verification failed:', adminError);
      return res.status(403).json({
        success: false,
        message: 'Access denied - admin account not found'
      });
    }

    console.log('Admin login successful for:', admin.email);

    res.status(200).json({
      token: data.session.access_token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'admin',
        isSuperAdmin: admin.is_super_admin
      }
    });
  } catch (error) {
    console.error('Exception in admin login:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all admins (admin only)
 */
const getAllAdmins = async (req, res) => {
  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id, email, name, is_super_admin, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch admins'
      });
    }

    res.status(200).json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get current admin profile
 */
const getAdminProfile = async (req, res) => {
  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, name, is_super_admin, created_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error || !admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }

    res.status(200).json({
      success: true,
      admin
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const adminLogout = async (req, res) => {
  try {
    const token = req.token;

    if (token) {
      await supabase.auth.signOut();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Reset admin password (requires setup key)
 * This allows resetting password when locked out
 */
const resetAdminPassword = async (req, res) => {
  try {
    const { email, newPassword, setupKey } = req.body;

    if (!email || !newPassword || !setupKey) {
      return res.status(400).json({
        success: false,
        message: 'Email, new password, and setup key are required'
      });
    }

    // Security check: require setup key
    const validSetupKey = process.env.SUPER_ADMIN_SETUP_KEY || 'prophets-legacy-super-admin-2024';

    if (setupKey !== validSetupKey) {
      return res.status(403).json({
        success: false,
        message: 'Invalid setup key'
      });
    }

    console.log('Resetting password for admin:', email);

    // Call database function to reset password
    const { data, error } = await supabase.rpc('reset_admin_password', {
      admin_email: email,
      new_password: newPassword
    });

    if (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reset password',
        details: error.message
      });
    }

    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: data.message || 'Admin not found'
      });
    }

    console.log('Password reset successfully for:', email);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  registerAdmin,
  initializeSuperAdmin,
  adminLogin,
  resetAdminPassword,
  getAllAdmins,
  getAdminProfile,
  adminLogout
};
