const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../config/supabase');

const JWT_SECRET = process.env.VITE_SUPABASE_ANON_KEY || 'your-secret-key';

const generateAccessToken = (userId, username, role) => {
  const payload = {
    id: userId,
    username,
    role,
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET);
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

const storeRefreshToken = async (token, userId, userType) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error } = await supabase
    .from('refresh_tokens')
    .insert({
      token,
      user_id: userId,
      user_type: userType,
      expires_at: expiresAt.toISOString()
    });

  if (error) {
    console.error('Store refresh token error:', error);
    throw new Error('Failed to store refresh token');
  }

  return true;
};

const verifyRefreshToken = async (token) => {
  const { data, error } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('token', token)
    .eq('is_revoked', false)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  if (new Date(data.expires_at) < new Date()) {
    return null;
  }

  await supabase
    .from('refresh_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  return data;
};

const revokeRefreshToken = async (token) => {
  const { error } = await supabase
    .from('refresh_tokens')
    .update({ is_revoked: true })
    .eq('token', token);

  return !error;
};

const revokeAllUserTokens = async (userId, userType) => {
  const { error } = await supabase
    .from('refresh_tokens')
    .update({ is_revoked: true })
    .eq('user_id', userId)
    .eq('user_type', userType);

  return !error;
};

const blacklistToken = async (token, userId, userType) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      return false;
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 10);

    const { error } = await supabase
      .from('token_blacklist')
      .insert({
        token,
        user_id: userId,
        user_type: userType,
        expires_at: expiresAt.toISOString()
      });

    return !error;
  } catch (error) {
    console.error('Blacklist token error:', error);
    return false;
  }
};

const isTokenBlacklisted = async (token) => {
  const { data, error } = await supabase
    .from('token_blacklist')
    .select('id')
    .eq('token', token)
    .maybeSingle();

  return !error && data !== null;
};

const cleanupExpiredTokens = async () => {
  const now = new Date().toISOString();

  await supabase
    .from('token_blacklist')
    .delete()
    .lt('expires_at', now);

  await supabase
    .from('refresh_tokens')
    .delete()
    .lt('expires_at', now);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  blacklistToken,
  isTokenBlacklisted,
  cleanupExpiredTokens
};
