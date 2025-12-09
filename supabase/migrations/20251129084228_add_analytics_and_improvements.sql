/*
  # Analytics and System Improvements
  
  1. New Tables
    - `lessons` - Add order_index column for lesson ordering
    - `user_statistics` - Track user activity and demographics
    - `login_events` - Track login activity
    - `activity_events` - Track user interactions
    - `technical_events` - Track crashes and performance
    
  2. Changes
    - Add order_index to lessons for proper ordering
    - Add country tracking for demographics
    - Add device info tracking
    
  3. Security
    - Enable RLS on all new tables
    - Add policies for admins to read analytics
*/

-- Add order_index to lessons if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE lessons ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create user statistics table
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  login_count INTEGER DEFAULT 0,
  lesson_completions INTEGER DEFAULT 0,
  challenge_completions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  country TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, date)
);

-- Create login events table
CREATE TABLE IF NOT EXISTS login_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  device_type TEXT,
  country TEXT,
  logged_in_at TIMESTAMPTZ DEFAULT now()
);

-- Create activity events table
CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create technical events table
CREATE TABLE IF NOT EXISTS technical_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add country to children table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'children' AND column_name = 'country'
  ) THEN
    ALTER TABLE children ADD COLUMN country TEXT;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_events ENABLE ROW LEVEL SECURITY;

-- Admin read policies
CREATE POLICY "Admins can read user statistics"
  ON user_statistics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can read login events"
  ON login_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can read activity events"
  ON activity_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can read technical events"
  ON technical_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- System can insert events
CREATE POLICY "System can insert login events"
  ON login_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can insert activity events"
  ON activity_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can insert technical events"
  ON technical_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_statistics_child_date ON user_statistics(child_id, date);
CREATE INDEX IF NOT EXISTS idx_login_events_child ON login_events(child_id, logged_in_at);
CREATE INDEX IF NOT EXISTS idx_activity_events_child ON activity_events(child_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lessons_category_order ON lessons(category_id, order_index);
