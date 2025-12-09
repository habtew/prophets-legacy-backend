/*
  # Create Predefined Avatars Table

  ## Purpose
  
  Store predefined avatar images that children can choose from without uploading their own.
  Admins can upload and manage these avatars.

  ## Tables Created
  
  1. **predefined_avatars**
     - `id` (uuid, primary key): Unique identifier
     - `name` (text): Display name for the avatar (e.g., "Pirate Boy", "Princess")
     - `image_url` (text): URL to the avatar image in storage
     - `category` (text): Category for grouping (e.g., "animals", "characters", "emojis")
     - `is_active` (boolean): Whether avatar is available for selection
     - `order_index` (integer): Display order
     - `created_by` (uuid): Admin who uploaded it
     - `created_at` (timestamptz): Creation timestamp
     - `updated_at` (timestamptz): Last update timestamp

  ## Access Control
  
  - **Admins**: Can create, update, delete avatars
  - **Everyone with token**: Can read/list all active avatars
  - **Public**: No access (require authentication to view)

  ## Security
  
  - RLS disabled (backend handles authorization)
  - Foreign key to admins table
  - Default values for timestamps
*/

-- Create predefined_avatars table
CREATE TABLE IF NOT EXISTS predefined_avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_predefined_avatars_active ON predefined_avatars(is_active);
CREATE INDEX IF NOT EXISTS idx_predefined_avatars_category ON predefined_avatars(category);
CREATE INDEX IF NOT EXISTS idx_predefined_avatars_order ON predefined_avatars(order_index);

-- Disable RLS (backend handles authorization)
ALTER TABLE predefined_avatars DISABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_predefined_avatars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_predefined_avatars_updated_at
  BEFORE UPDATE ON predefined_avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_predefined_avatars_updated_at();