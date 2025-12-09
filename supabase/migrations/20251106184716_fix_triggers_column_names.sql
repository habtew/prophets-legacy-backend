/*
  # Fix Trigger Functions with Correct Column Names

  1. Issues Found
    - Leaderboards table uses `rank` not `rank_position`
    - Leaderboards table uses `stars` not `total_stars`
    - Trigger function needs to match actual schema

  2. Solution
    - Drop and recreate trigger functions with correct column names
    - Ensure proper upsert logic
    - Fix rank calculation
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_child_stars_change ON children;
DROP TRIGGER IF EXISTS on_child_created ON children;
DROP FUNCTION IF EXISTS update_leaderboard_on_stars_change();

-- Recreate function with correct column names
CREATE OR REPLACE FUNCTION public.update_leaderboard_on_stars_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert leaderboard entry
  INSERT INTO leaderboards (child_id, stars, rank, period, calculated_at)
  VALUES (NEW.id, NEW.total_stars, 0, 'all_time', NOW())
  ON CONFLICT (child_id, period) 
  DO UPDATE SET 
    stars = NEW.total_stars,
    calculated_at = NOW();

  -- Recalculate ranks for this level
  WITH ranked_children AS (
    SELECT 
      l.id,
      ROW_NUMBER() OVER (
        PARTITION BY c.level 
        ORDER BY l.stars DESC, l.calculated_at ASC
      ) as new_rank
    FROM leaderboards l
    JOIN children c ON l.child_id = c.id
    WHERE l.period = 'all_time'
  )
  UPDATE leaderboards l
  SET rank = r.new_rank
  FROM ranked_children r
  WHERE l.id = r.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers
CREATE TRIGGER on_child_stars_change
  AFTER UPDATE OF total_stars ON children
  FOR EACH ROW
  WHEN (NEW.total_stars IS DISTINCT FROM OLD.total_stars)
  EXECUTE FUNCTION update_leaderboard_on_stars_change();

CREATE TRIGGER on_child_created
  AFTER INSERT ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard_on_stars_change();

-- Initialize leaderboard for all existing children who don't have entries
INSERT INTO leaderboards (child_id, stars, rank, period, calculated_at)
SELECT 
  c.id,
  c.total_stars,
  0,
  'all_time',
  NOW()
FROM children c
WHERE NOT EXISTS (
  SELECT 1 FROM leaderboards l 
  WHERE l.child_id = c.id AND l.period = 'all_time'
);

-- Recalculate all ranks
WITH ranked_children AS (
  SELECT 
    l.id,
    ROW_NUMBER() OVER (
      PARTITION BY c.level 
      ORDER BY l.stars DESC, l.calculated_at ASC
    ) as new_rank
  FROM leaderboards l
  JOIN children c ON l.child_id = c.id
  WHERE l.period = 'all_time'
)
UPDATE leaderboards l
SET rank = r.new_rank
FROM ranked_children r
WHERE l.id = r.id;
