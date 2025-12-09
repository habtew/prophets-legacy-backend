/*
  # Challenge Tables for The Prophet's Legacy

  1. New Tables
    - `challenge_categories` - Categories for challenges (e.g., Word Ordering)
      - `id` (uuid, primary key)
      - `name` (text)
      - `level` (integer)
      - `pass_percentage` (integer, default 70)
      - `is_published` (boolean, default false)
      - `created_at` (timestamptz)
    
    - `challenge_questions` - Questions within challenge categories
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `type` (text) - multiple_choice, word_ordering, letter_arrangement, etc.
      - `question` (text)
      - `options` (jsonb)
      - `answer` (jsonb)
      - `time_limit_sec` (integer, default 30)
      - `order_index` (integer)
      - `created_at` (timestamptz)
    
    - `attempt_sessions` - Challenge attempt sessions
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - `status` (text) - active, completed
      - `final_score` (integer)
      - `stars_earned` (integer)
      - `passed` (boolean)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
    
    - `attempt_answers` - Individual answers in a session
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `question_id` (uuid, foreign key)
      - `answer` (jsonb)
      - `is_correct` (boolean)
      - `time_taken_sec` (integer)
      - `score` (integer)
      - `answered_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access with proper ownership checks
*/

-- Challenge categories
CREATE TABLE IF NOT EXISTS challenge_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level integer NOT NULL,
  pass_percentage integer DEFAULT 70,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE challenge_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view published challenge categories"
  ON challenge_categories FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Challenge questions
CREATE TABLE IF NOT EXISTS challenge_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES challenge_categories(id) ON DELETE CASCADE,
  type text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  answer jsonb NOT NULL,
  time_limit_sec integer DEFAULT 30,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE challenge_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view questions from published categories"
  ON challenge_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenge_categories
      WHERE challenge_categories.id = category_id
      AND challenge_categories.is_published = true
    )
  );

-- Attempt sessions
CREATE TABLE IF NOT EXISTS attempt_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  category_id uuid REFERENCES challenge_categories(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  final_score integer,
  stars_earned integer,
  passed boolean,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE attempt_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own attempt sessions"
  ON attempt_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id OR auth.uid() IN (SELECT parent_id FROM children WHERE id = child_id));

CREATE POLICY "Children can insert own attempt sessions"
  ON attempt_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = child_id);

CREATE POLICY "Children can update own attempt sessions"
  ON attempt_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = child_id)
  WITH CHECK (auth.uid() = child_id);

-- Attempt answers
CREATE TABLE IF NOT EXISTS attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES attempt_sessions(id) ON DELETE CASCADE,
  question_id uuid REFERENCES challenge_questions(id) ON DELETE CASCADE,
  answer jsonb NOT NULL,
  is_correct boolean NOT NULL,
  time_taken_sec integer NOT NULL,
  score integer DEFAULT 0,
  answered_at timestamptz DEFAULT now(),
  UNIQUE(session_id, question_id)
);

ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own attempt answers"
  ON attempt_answers FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT child_id FROM attempt_sessions WHERE id = session_id
    )
  );

CREATE POLICY "Children can insert own attempt answers"
  ON attempt_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT child_id FROM attempt_sessions WHERE id = session_id
    )
  );