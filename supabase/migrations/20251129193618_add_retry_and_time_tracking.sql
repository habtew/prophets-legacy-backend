/*
  # Add Retry and Time Tracking for Challenges
  
  1. Changes
    - Add attempt_number to attempt_answers for tracking retries
    - Add time_started to attempt_answers for per-question time tracking
    - Add time_penalty and repeat_penalty to attempt_answers
    
  2. Notes
    - Allows multiple attempts per question with penalties
    - Tracks start time for each question attempt
*/

-- Add columns to attempt_answers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attempt_answers' AND column_name = 'attempt_number'
  ) THEN
    ALTER TABLE attempt_answers ADD COLUMN attempt_number INTEGER DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attempt_answers' AND column_name = 'time_started'
  ) THEN
    ALTER TABLE attempt_answers ADD COLUMN time_started TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attempt_answers' AND column_name = 'time_penalty'
  ) THEN
    ALTER TABLE attempt_answers ADD COLUMN time_penalty INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attempt_answers' AND column_name = 'repeat_penalty'
  ) THEN
    ALTER TABLE attempt_answers ADD COLUMN repeat_penalty INTEGER DEFAULT 0;
  END IF;
END $$;

-- Remove unique constraint if it exists to allow retries
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'attempt_answers_session_id_question_id_key'
  ) THEN
    ALTER TABLE attempt_answers DROP CONSTRAINT attempt_answers_session_id_question_id_key;
  END IF;
END $$;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_attempt_answers_session_question ON attempt_answers(session_id, question_id, attempt_number);
