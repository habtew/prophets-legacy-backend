/*
  # Add Admin Write Policies

  1. Issue
    - Tables only have SELECT policies
    - Admins can't INSERT/UPDATE/DELETE
    - All admin operations return 500 errors

  2. Solution
    - Add INSERT/UPDATE/DELETE policies for admins
    - Verify user has admin role before allowing write operations
*/

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- LESSON CATEGORIES
CREATE POLICY "Admins can insert lesson categories"
  ON lesson_categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update lesson categories"
  ON lesson_categories FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete lesson categories"
  ON lesson_categories FOR DELETE
  TO authenticated
  USING (is_admin());

-- LESSONS
CREATE POLICY "Admins can insert lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (is_admin());

-- CHALLENGE CATEGORIES
CREATE POLICY "Admins can insert challenge categories"
  ON challenge_categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update challenge categories"
  ON challenge_categories FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete challenge categories"
  ON challenge_categories FOR DELETE
  TO authenticated
  USING (is_admin());

-- CHALLENGE QUESTIONS
CREATE POLICY "Admins can insert challenge questions"
  ON challenge_questions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update challenge questions"
  ON challenge_questions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete challenge questions"
  ON challenge_questions FOR DELETE
  TO authenticated
  USING (is_admin());

-- MEDIA
CREATE POLICY "Admins can insert media"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update media"
  ON media FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete media"
  ON media FOR DELETE
  TO authenticated
  USING (is_admin());

-- ACHIEVEMENTS
CREATE POLICY "Admins can insert achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update achievements"
  ON achievements FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete achievements"
  ON achievements FOR DELETE
  TO authenticated
  USING (is_admin());

-- REMINDERS
CREATE POLICY "Admins can insert global reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (is_admin());

-- NOTIFICATION TEMPLATES
CREATE POLICY "Admins can insert notification templates"
  ON notification_templates FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update notification templates"
  ON notification_templates FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete notification templates"
  ON notification_templates FOR DELETE
  TO authenticated
  USING (is_admin());

-- NOTIFICATION CAMPAIGNS
CREATE POLICY "Admins can insert notification campaigns"
  ON notification_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update notification campaigns"
  ON notification_campaigns FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete notification campaigns"
  ON notification_campaigns FOR DELETE
  TO authenticated
  USING (is_admin());
