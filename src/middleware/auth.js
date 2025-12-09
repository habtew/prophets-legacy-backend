const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('../utils/tokenManager');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({ success: false, message: 'Token has been revoked' });
    }

    // Try to verify as custom JWT first
    try {
      const decoded = jwt.verify(token, process.env.VITE_SUPABASE_ANON_KEY || 'your-secret-key');

      // If role is child, verify child exists in database
      if (decoded.role === 'child') {
        const { data: child, error: childError } = await supabase
          .from('children')
          .select('id, username, display_name')
          .eq('id', decoded.id)
          .maybeSingle();

        if (childError) {
          console.error('Child lookup error:', childError);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!child) {
          return res.status(401).json({ success: false, message: 'Child not found' });
        }

        req.user = {
          id: decoded.id,
          username: decoded.username,
          role: 'child',
          user_metadata: { role: 'child' }
        };
        req.token = token;
        return next();
      }

      // If role is admin, verify admin exists
      if (decoded.role === 'admin') {
        const { data: admin, error: adminError } = await supabase
          .from('admins')
          .select('id, username')
          .eq('id', decoded.id)
          .maybeSingle();

        if (adminError) {
          console.error('Admin lookup error:', adminError);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!admin) {
          return res.status(401).json({ success: false, message: 'Admin not found' });
        }

        req.user = {
          id: decoded.id,
          username: decoded.username,
          role: 'admin',
          user_metadata: { role: 'admin' }
        };
        req.token = token;
        return next();
      }
    } catch (jwtError) {
      // Not a custom JWT, try Supabase auth
    }

    // Try Supabase auth for parent tokens
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

const requireRole = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = req.user.user_metadata?.role || req.user.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    next();
  };
};

const requireChild = requireRole('child');
const requireAdmin = requireRole('admin');
const requireInternal = requireRole('internal');

module.exports = {
  authenticateToken,
  requireRole,
  requireChild,
  requireAdmin,
  requireInternal
};
