/*
  # Notification, Media, and Share Tables

  1. New Tables
    - `notifications` - Parent notifications
      - `id` (uuid, primary key)
      - `parent_id` (uuid, foreign key)
      - `message` (text)
      - `type` (text) - lesson_completed, challenge_completed, achievement_unlocked
      - `is_read` (boolean, default false)
      - `created_at` (timestamptz)
    
    - `notification_templates` - Admin-managed notification templates
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - reminder, tip, announcement
      - `content` (jsonb) - Multi-language content
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `notification_campaigns` - Scheduled notification campaigns
      - `id` (uuid, primary key)
      - `template_id` (uuid, foreign key)
      - `target` (jsonb) - Targeting criteria
      - `schedule` (timestamptz)
      - `status` (text) - scheduled, sent, failed
      - `created_at` (timestamptz)
    
    - `notification_preferences` - User notification settings
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `push_tips` (boolean, default true)
      - `push_reminders` (boolean, default true)
      - `locale` (text, default 'en')
      - `quiet_hours_start` (text)
      - `quiet_hours_end` (text)
      - `timezone` (text, default 'UTC')
      - `updated_at` (timestamptz)
    
    - `media` - Media asset metadata
      - `id` (uuid, primary key)
      - `asset_key` (text, unique)
      - `filename` (text)
      - `content_type` (text)
      - `bucket` (text)
      - `size` (integer)
      - `uploaded_by` (uuid)
      - `created_at` (timestamptz)
    
    - `shareables` - Social share render jobs
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `source_type` (text) - lesson, challenge, achievement
      - `source_id` (uuid)
      - `format` (text) - image, video
      - `status` (text) - pending, processing, completed, failed
      - `download_url` (text)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
    
    - `share_tracking` - Track social shares
      - `id` (uuid, primary key)
      - `share_id` (uuid, foreign key)
      - `platform` (text) - whatsapp, facebook, twitter, etc.
      - `tracked_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = parent_id)
  WITH CHECK (auth.uid() = parent_id);

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view notification templates"
  ON notification_templates FOR SELECT
  TO authenticated
  USING (true);

-- Notification campaigns
CREATE TABLE IF NOT EXISTS notification_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES notification_templates(id) ON DELETE CASCADE,
  target jsonb NOT NULL,
  schedule timestamptz NOT NULL,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notification_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage campaigns"
  ON notification_campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  push_tips boolean DEFAULT true,
  push_reminders boolean DEFAULT true,
  locale text DEFAULT 'en',
  quiet_hours_start text,
  quiet_hours_end text,
  timezone text DEFAULT 'UTC',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Media
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_key text UNIQUE NOT NULL,
  filename text NOT NULL,
  content_type text NOT NULL,
  bucket text NOT NULL,
  size integer,
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view media"
  ON media FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert media"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Shareables
CREATE TABLE IF NOT EXISTS shareables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  format text NOT NULL,
  status text DEFAULT 'pending',
  download_url text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE shareables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own shareables"
  ON shareables FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id);

CREATE POLICY "Children can create shareables"
  ON shareables FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = child_id);

-- Share tracking
CREATE TABLE IF NOT EXISTS share_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id uuid REFERENCES shareables(id) ON DELETE CASCADE,
  platform text NOT NULL,
  tracked_at timestamptz DEFAULT now()
);

ALTER TABLE share_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert share tracking"
  ON share_tracking FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view share tracking"
  ON share_tracking FOR SELECT
  TO anon, authenticated
  USING (true);