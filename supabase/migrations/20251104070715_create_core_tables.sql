/*
  # Core Tables for The Prophet's Legacy

  1. New Tables
    - `parents` - Parent user accounts
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text)
      - `email_confirmed` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `children` - Child profiles linked to parents
      - `id` (uuid, primary key)
      - `parent_id` (uuid, foreign key)
      - `username` (text, unique)
      - `display_name` (text)
      - `age_group` (text)
      - `avatar_url` (text)
      - `level` (integer, default 1)
      - `total_stars` (integer, default 0)
      - `current_streak` (integer, default 0)
      - `last_activity_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `lesson_categories` - Categories for lessons (e.g., Prophet's Description)
      - `id` (uuid, primary key)
      - `name` (text)
      - `level` (integer)
      - `created_at` (timestamptz)
    
    - `lessons` - Educational content
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `level` (integer)
      - `title` (text)
      - `description` (text)
      - `audio_url` (text)
      - `image_url` (text)
      - `video_url` (text)
      - `stars_reward` (integer, default 5)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `lesson_completions` - Track completed lessons
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `lesson_id` (uuid, foreign key)
      - `stars_earned` (integer)
      - `completed_at` (timestamptz)
    
    - `favorites` - Child's favorite lessons
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `lesson_id` (uuid, foreign key)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access with proper ownership checks
*/

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  email_confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own profile"
  ON parents FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Parents can update own profile"
  ON parents FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  age_group text NOT NULL,
  avatar_url text,
  level integer DEFAULT 1,
  total_stars integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own profile"
  ON children FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = parent_id);

CREATE POLICY "Parents can insert children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Children and parents can update profile"
  ON children FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = parent_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = parent_id);

-- Lesson categories
CREATE TABLE IF NOT EXISTS lesson_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view lesson categories"
  ON lesson_categories FOR SELECT
  TO authenticated
  USING (true);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES lesson_categories(id) ON DELETE CASCADE,
  level integer NOT NULL,
  title text NOT NULL,
  description text,
  audio_url text,
  image_url text,
  video_url text,
  stars_reward integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- Lesson completions
CREATE TABLE IF NOT EXISTS lesson_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  stars_earned integer NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(child_id, lesson_id)
);

ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own completions"
  ON lesson_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id OR auth.uid() IN (SELECT parent_id FROM children WHERE id = child_id));

CREATE POLICY "Children can insert own completions"
  ON lesson_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = child_id);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(child_id, lesson_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id);

CREATE POLICY "Children can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = child_id);

CREATE POLICY "Children can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = child_id);