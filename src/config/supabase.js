const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Global supabase client (for unauthenticated or read-only operations)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create an authenticated supabase client for admin operations
// This passes the admin's JWT token so RLS policies can identify them
const createAuthenticatedClient = (accessToken) => {
  if (!accessToken) {
    console.error('ERROR: createAuthenticatedClient called without token!');
    return supabase;
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  console.log('Created authenticated client with token');
  return authClient;
};

module.exports = supabase;
module.exports.createAuthenticatedClient = createAuthenticatedClient;
