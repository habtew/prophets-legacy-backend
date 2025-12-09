/*
  # Add Streak Tracking Fields
  
  Adding fields to track maximum streak and last activity date for automatic streak reset.
  
  1. Changes to children table:
     - Add max_streak integer (tracks highest streak achieved)
     - Add last_activity_date timestamptz (tracks last lesson/challenge completion)
  
  2. Logic:
     - max_streak stores the highest current_streak value ever achieved
     - last_activity_date updates whenever a lesson or challenge is completed
     - If more than 24 hours pass without activity, current_streak resets to 0
*/

-- Add max_streak and last_activity_date to children table
ALTER TABLE children 
ADD COLUMN IF NOT EXISTS max_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date timestamptz DEFAULT now();

-- Update max_streak for existing children (set to current_streak value)
UPDATE children 
SET max_streak = current_streak 
WHERE max_streak IS NULL OR max_streak < current_streak;
