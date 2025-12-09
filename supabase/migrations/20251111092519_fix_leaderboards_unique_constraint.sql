/*
  # Fix Leaderboards Unique Constraint

  ## Problem
  
  Child registration fails with error:
  "there is no unique or exclusion constraint matching the ON CONFLICT specification"
  
  The trigger `update_leaderboard_on_stars_change()` tries to use:
  `ON CONFLICT (child_id, period)`
  
  But there's no unique constraint on these columns.

  ## Solution
  
  Add a unique constraint on (child_id, period) to the leaderboards table.
  This allows the trigger's ON CONFLICT clause to work correctly.

  ## Changes Made
  
  1. Add unique constraint on (child_id, period)
  2. This ensures one leaderboard entry per child per period
  3. Enables upsert behavior in the trigger
*/

-- Add unique constraint on (child_id, period)
-- Drop the constraint first if it exists to avoid duplicate constraint errors
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'leaderboards_child_id_period_key'
  ) THEN
    ALTER TABLE leaderboards 
    ADD CONSTRAINT leaderboards_child_id_period_key 
    UNIQUE (child_id, period);
  END IF;
END $$;