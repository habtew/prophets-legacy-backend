/*
  # Restructure Application - Step 4: Update All Tables

  ## Changes
  - Update children table (remove parent_id, age_group; add age)
  - Update lesson_categories for hierarchical structure
  - Rename and update notifications tables
  - Create main categories
  - Add RLS policies
*/

-- Update children table
ALTER TABLE children 
  DROP COLUMN IF EXISTS parent_id CASCADE,
  DROP COLUMN IF EXISTS age_group,
  ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 3 AND age <= 18);

-- Update lesson_categories for hierarchical structure
ALTER TABLE lesson_categories
  ADD COLUMN IF NOT EXISTS parent_category_id UUID REFERENCES lesson_categories(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_main_category BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Update notifications table
ALTER TABLE notifications
  DROP COLUMN IF EXISTS parent_id CASCADE,
  ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES children(id) ON DELETE CASCADE;

-- Rename parent_notifications to child_notifications
ALTER TABLE parent_notifications RENAME TO child_notifications;

-- Update child_notifications structure
ALTER TABLE child_notifications
  DROP COLUMN IF EXISTS parent_id CASCADE;

-- Ensure child_id is NOT NULL
ALTER TABLE child_notifications
  ALTER COLUMN child_id SET NOT NULL;

-- Update reminders
UPDATE reminders SET is_global = false WHERE child_id IS NOT NULL;

-- Create main categories
DO $$
BEGIN
  -- Check if main categories already exist
  IF NOT EXISTS (SELECT 1 FROM lesson_categories WHERE name = 'The Description of the Prophet' AND is_main_category = true) THEN
    INSERT INTO lesson_categories (name, level, is_main_category, order_index, description, image_url)
    VALUES ('The Description of the Prophet', 1, true, 1, 'Learn about the physical appearance, character, and life of Prophet Muhammad (peace be upon him)', NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM lesson_categories WHERE name = 'Virtues of Deeds' AND is_main_category = true) THEN
    INSERT INTO lesson_categories (name, level, is_main_category, order_index, description, image_url)
    VALUES ('Virtues of Deeds', 1, true, 2, 'Learn about the virtuous deeds and their rewards in Islam', NULL);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lesson_categories_parent_category ON lesson_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_lesson_categories_main ON lesson_categories(is_main_category) WHERE is_main_category = true;
CREATE INDEX IF NOT EXISTS idx_children_age ON children(age);
CREATE INDEX IF NOT EXISTS idx_children_sex ON children(sex);
CREATE INDEX IF NOT EXISTS idx_notifications_child ON notifications(child_id);
CREATE INDEX IF NOT EXISTS idx_child_notifications_child ON child_notifications(child_id);

-- Add RLS policies for notifications
CREATE POLICY "Children can read own notifications"
  ON notifications FOR SELECT
  USING (child_id IN (SELECT id FROM children));

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Add RLS policies for child_notifications
CREATE POLICY "Children can read own child notifications"
  ON child_notifications FOR SELECT
  USING (child_id IN (SELECT id FROM children));

CREATE POLICY "Children can update own child notifications"
  ON child_notifications FOR UPDATE
  USING (child_id IN (SELECT id FROM children));

CREATE POLICY "System can insert child notifications"
  ON child_notifications FOR INSERT
  WITH CHECK (true);

-- Add comments
COMMENT ON COLUMN lesson_categories.parent_category_id IS 'Links to parent category for hierarchical structure: Main Category → Sub Category → Lessons';
COMMENT ON COLUMN lesson_categories.is_main_category IS 'True for top-level categories (The Description of the Prophet, Virtues of Deeds)';
COMMENT ON COLUMN children.age IS 'Child age in years (3-18)';
COMMENT ON COLUMN children.sex IS 'Child gender: male or female';