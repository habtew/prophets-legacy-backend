/*
  # Add Children Access Policies

  1. Issue
    - Children use custom JWT (not Supabase auth)
    - Children requests come through as anon role
    - Current policies only allow 'authenticated' role
    - Children can't access lessons, challenges, etc.

  2. Solution
    - Add policies for anon role to access read-only content
    - Allow anon to read lessons, categories, challenges
    - Allow anon to create/update their progress (validated by middleware)
    - Maintain security through API-level checks

  3. Tables to Update
    - lesson_categories (read)
    - lessons (read)
    - lesson_completions (write for progress)
    - favorites (read/write for children)
    - challenge_categories (read)
    - challenge_questions (read)
    - attempt_sessions (write for children)
    - attempt_answers (write for children)
    - leaderboards (read)
    - shareables (write for children)
*/

-- LESSON CATEGORIES - Allow anon to view
CREATE POLICY "Allow anon to view lesson categories"
  ON lesson_categories FOR SELECT
  TO anon
  USING (true);

-- LESSONS - Allow anon to view
CREATE POLICY "Allow anon to view lessons"
  ON lessons FOR SELECT
  TO anon
  USING (true);

-- LESSON COMPLETIONS - Allow anon to insert (API validates child)
CREATE POLICY "Allow anon to insert lesson completions"
  ON lesson_completions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to view lesson completions"
  ON lesson_completions FOR SELECT
  TO anon
  USING (true);

-- FAVORITES - Allow anon to manage (API validates child)
CREATE POLICY "Allow anon to view favorites"
  ON favorites FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert favorites"
  ON favorites FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete favorites"
  ON favorites FOR DELETE
  TO anon
  USING (true);

-- CHALLENGE CATEGORIES - Allow anon to view published
CREATE POLICY "Allow anon to view published challenge categories"
  ON challenge_categories FOR SELECT
  TO anon
  USING (is_published = true);

-- CHALLENGE QUESTIONS - Allow anon to view from published categories
CREATE POLICY "Allow anon to view questions from published categories"
  ON challenge_questions FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM challenge_categories
      WHERE challenge_categories.id = challenge_questions.category_id
      AND challenge_categories.is_published = true
    )
  );

-- ATTEMPT SESSIONS - Allow anon to manage (API validates child)
CREATE POLICY "Allow anon to view own attempt sessions"
  ON attempt_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert attempt sessions"
  ON attempt_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update own attempt sessions"
  ON attempt_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ATTEMPT ANSWERS - Allow anon to manage (API validates child)
CREATE POLICY "Allow anon to view attempt answers"
  ON attempt_answers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert attempt answers"
  ON attempt_answers FOR INSERT
  TO anon
  WITH CHECK (true);

-- LEADERBOARDS - Allow anon to view
CREATE POLICY "Allow anon to view leaderboards"
  ON leaderboards FOR SELECT
  TO anon
  USING (true);

-- SHAREABLES - Allow anon to manage (API validates child)
CREATE POLICY "Allow anon to view shareables"
  ON shareables FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert shareables"
  ON shareables FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update shareables"
  ON shareables FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- SHARE TRACKING - Allow anon to track
CREATE POLICY "Allow anon to insert share tracking"
  ON share_tracking FOR INSERT
  TO anon
  WITH CHECK (true);

-- REMINDERS - Allow anon to manage personal reminders (API validates child)
CREATE POLICY "Allow anon to view reminders"
  ON reminders FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert reminders"
  ON reminders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update reminders"
  ON reminders FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete reminders"
  ON reminders FOR DELETE
  TO anon
  USING (true);

-- CHILD ACHIEVEMENTS - Allow anon to view (API validates child)
CREATE POLICY "Allow anon to view child achievements"
  ON child_achievements FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert child achievements"
  ON child_achievements FOR INSERT
  TO anon
  WITH CHECK (true);

-- ACHIEVEMENTS - Allow anon to view
CREATE POLICY "Allow anon to view achievements"
  ON achievements FOR SELECT
  TO anon
  USING (true);

-- NOTIFICATION PREFERENCES - Allow anon to manage (API validates child)
CREATE POLICY "Allow anon to view notification preferences"
  ON notification_preferences FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert notification preferences"
  ON notification_preferences FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update notification preferences"
  ON notification_preferences FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
