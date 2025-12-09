/*
  # Add created_at to attempt_answers
  
  Adding timestamp field to track when each answer was submitted.
  This is needed for dynamic time calculation between answers.
*/

ALTER TABLE attempt_answers 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_attempt_answers_session_created 
ON attempt_answers(session_id, created_at DESC);
