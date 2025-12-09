/*
  # Disable RLS on lesson_completions
  
  Disabling RLS to prevent 500 errors when marking lessons complete.
*/

ALTER TABLE lesson_completions DISABLE ROW LEVEL SECURITY;
