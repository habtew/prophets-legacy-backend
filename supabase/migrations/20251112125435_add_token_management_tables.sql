/*
  # Token Management System

  1. New Tables
    - `token_blacklist`
      - `id` (uuid, primary key)
      - `token` (text, unique) - Blacklisted access token
      - `user_id` (uuid) - User who owns the token
      - `user_type` (text) - Type: 'parent', 'child', 'admin'
      - `expires_at` (timestamptz) - When token naturally expires
      - `blacklisted_at` (timestamptz) - When token was blacklisted

    - `refresh_tokens`
      - `id` (uuid, primary key)
      - `token` (text, unique) - Refresh token
      - `user_id` (uuid) - User who owns the token
      - `user_type` (text) - Type: 'parent', 'child', 'admin'
      - `expires_at` (timestamptz) - When refresh token expires
      - `created_at` (timestamptz) - When token was created
      - `last_used_at` (timestamptz) - Last time token was used
      - `is_revoked` (boolean) - Whether token is revoked

  2. Security
    - Disable RLS on both tables for backend access
    - Backend uses service role key to manage tokens

  3. Indexes
    - Index on token for fast lookups
    - Index on user_id for cleanup
    - Index on expires_at for cleanup
*/

-- Create token_blacklist table
CREATE TABLE IF NOT EXISTS token_blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  user_id uuid NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('parent', 'child', 'admin')),
  expires_at timestamptz NOT NULL,
  blacklisted_at timestamptz DEFAULT now()
);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  user_id uuid NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('parent', 'child', 'admin')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now(),
  is_revoked boolean DEFAULT false
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Disable RLS so backend can access with service role
ALTER TABLE token_blacklist DISABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens DISABLE ROW LEVEL SECURITY;
