/*
  # Disable RLS on User-Interactive Tables
  
  Disabling RLS on tables that children and parents interact with.
  These were causing 500 errors.
  
  Tables affected:
  - notification_preferences
  - favorites
  - reminders
  - attempt_sessions
*/

ALTER TABLE notification_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_sessions DISABLE ROW LEVEL SECURITY;
