/*
  # Create Share Jobs Table
  
  Creates table for tracking share/render jobs for social media sharing.
  
  1. New Table:
     - share_jobs: Tracks rendering jobs for share images
       - id (uuid, primary key)
       - child_id (uuid, foreign key to children)
       - status (text: 'pending', 'completed', 'failed')
       - image_url (text, nullable - populated when completed)
       - created_at (timestamptz)
  
  2. Security:
     - RLS disabled for now (will add proper policies later)
*/

CREATE TABLE IF NOT EXISTS share_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Disable RLS for now
ALTER TABLE share_jobs DISABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_share_jobs_child_id ON share_jobs(child_id);
CREATE INDEX IF NOT EXISTS idx_share_jobs_status ON share_jobs(status);
