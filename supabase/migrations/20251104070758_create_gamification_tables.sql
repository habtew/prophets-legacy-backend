/*
  # Gamification & Reminder Tables

  1. New Tables
    - `achievements` - Unlockable achievements
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `rule` (text) - Description of unlock condition
      - `icon_url` (text)
      - `created_at` (timestamptz)
    
    - `child_achievements` - Track unlocked achievements
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `achievement_id` (uuid, foreign key)
      - `unlocked_at` (timestamptz)
    
    - `leaderboards` - Pre-calculated leaderboard rankings
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `period` (text) - daily, weekly, monthly
      - `rank` (integer)
      - `stars` (integer)
      - `calculated_at` (timestamptz)
    
    - `reminders` - Personal and global reminders
      - `id` (uuid, primary key)
      - `child_id` (uuid, nullable, for personal reminders)
      - `is_global` (boolean, default false)
      - `title` (text)
      - `message` (text)
      - `time` (text) - HH:MM format
      - `timezone` (text)
      - `repeat` (text) - daily, weekly, custom
      - `sound_ref` (text)
      - `enabled` (boolean, default true)
      - `locale` (text, default 'en')
      - `active` (boolean, default true)
      - `created_at` (timestamptz)
    
    - `sfx` - Sound effects
      - `id` (uuid, primary key)
      - `name` (text)
      - `url` (text)
      - `created_at` (timestamptz)
    
    - `animations` - Celebration animations
      - `id` (uuid, primary key)
      - `name` (text)
      - `url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  rule text NOT NULL,
  icon_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Child achievements
CREATE TABLE IF NOT EXISTS child_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(child_id, achievement_id)
);

ALTER TABLE child_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own achievements"
  ON child_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id OR auth.uid() IN (SELECT parent_id FROM children WHERE id = child_id));

CREATE POLICY "System can insert achievements"
  ON child_achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  period text NOT NULL,
  rank integer NOT NULL,
  stars integer NOT NULL,
  calculated_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view leaderboards"
  ON leaderboards FOR SELECT
  TO authenticated
  USING (true);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  is_global boolean DEFAULT false,
  title text NOT NULL,
  message text,
  time text NOT NULL,
  timezone text DEFAULT 'UTC',
  repeat text DEFAULT 'daily',
  sound_ref text DEFAULT 'default_chime.mp3',
  enabled boolean DEFAULT true,
  locale text DEFAULT 'en',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own and global reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (is_global = true OR auth.uid() = child_id);

CREATE POLICY "Children can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = child_id AND is_global = false);

CREATE POLICY "Children can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = child_id AND is_global = false)
  WITH CHECK (auth.uid() = child_id AND is_global = false);

CREATE POLICY "Children can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = child_id AND is_global = false);

-- SFX
CREATE TABLE IF NOT EXISTS sfx (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sfx ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view sfx"
  ON sfx FOR SELECT
  TO authenticated
  USING (true);

-- Animations
CREATE TABLE IF NOT EXISTS animations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE animations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view animations"
  ON animations FOR SELECT
  TO authenticated
  USING (true);