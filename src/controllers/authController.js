const supabase = require('../config/supabase');

const registerParent = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role: 'parent'
        },
        emailRedirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/auth/confirm`
      }
    });

    if (error) {
      console.error('Supabase auth signup error:', error);
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists' });
      }
      return res.status(400).json({ success: false, message: error.message });
    }

    if (!data.user) {
      return res.status(500).json({ success: false, message: 'User creation failed' });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      parentId: data.user.id,
      email: data.user.email,
      emailConfirmed: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const confirmEmail = async (req, res) => {
  try {
    const { token_hash, type } = req.query;

    if (!token_hash || !type) {
      return res.status(400).json({
        success: false,
        message: 'Token hash and type are required in query parameters'
      });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type
    });

    if (error) {
      console.error('Email verification error:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired confirmation link',
        details: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    });
  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    console.log('Parent login attempt for:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Parent login error:', error.message);
      return res.status(401).json({ success: false, message: 'Invalid email or password', details: error.message });
    }

    if (!data.session || !data.user) {
      console.error('No session or user returned');
      return res.status(401).json({ success: false, message: 'Login failed - no session created' });
    }

    console.log('Parent login successful for:', data.user.email);

    res.status(200).json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        role: data.user.user_metadata.role || 'parent',
        name: data.user.user_metadata.name
      }
    });
  } catch (error) {
    console.error('Exception in parent login:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.APP_URL}/reset-password`
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const confirmPasswordReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return res.status(400).json({ success: false, message: 'Invalid/expired token or weak new password' });
    }

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.token;
    const userId = req.user.id;
    const userRole = req.user.user_metadata?.role || req.user.role;

    if (token) {
      if (userRole === 'child') {
        const { blacklistToken } = require('../utils/tokenManager');
        await blacklistToken(token, userId, 'child');
      } else if (userRole === 'parent') {
        await supabase.auth.signOut();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const { verifyRefreshToken, generateAccessToken, generateRefreshToken, storeRefreshToken, revokeRefreshToken } = require('../utils/tokenManager');

    const tokenData = await verifyRefreshToken(refreshToken);

    if (!tokenData) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    if (tokenData.user_type === 'child') {
      const { data: child } = await supabase
        .from('children')
        .select('id, username')
        .eq('id', tokenData.user_id)
        .maybeSingle();

      if (!child) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      await revokeRefreshToken(refreshToken);

      const newAccessToken = generateAccessToken(child.id, child.username, 'child');
      const newRefreshToken = generateRefreshToken();

      await storeRefreshToken(newRefreshToken, child.id, 'child');

      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: '1h'
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid token type' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  registerParent,
  confirmEmail,
  login,
  logout,
  requestPasswordReset,
  confirmPasswordReset,
  refreshToken
};
