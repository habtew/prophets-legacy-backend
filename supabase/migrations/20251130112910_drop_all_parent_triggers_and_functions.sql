/*
  # Drop ALL parent-related triggers and functions

  1. Changes
    - Drop trigger on_lesson_completed from lesson_completions
    - Drop trigger on_challenge_completed from attempt_sessions
    - Drop function notify_parent_lesson_complete
    - Drop function notify_parent_challenge_complete
    - Drop parent_notifications table if it exists

  2. Reason
    - These triggers reference parent_id which no longer exists
    - Parent system has been completely removed
    - No notifications to parents needed anymore
*/

-- Drop triggers first
DROP TRIGGER IF EXISTS on_lesson_completed ON lesson_completions;
DROP TRIGGER IF EXISTS on_challenge_completed ON attempt_sessions;

-- Drop the functions
DROP FUNCTION IF EXISTS notify_parent_lesson_complete();
DROP FUNCTION IF EXISTS notify_parent_challenge_complete();

-- Drop parent_notifications table if it exists
DROP TABLE IF EXISTS parent_notifications CASCADE;
