/*
  # Fix Admin RLS Policies and Seed Challenge Categories

  1. Issues Fixed
    - sfx table missing INSERT/UPDATE/DELETE policies for admins
    - animations table missing INSERT/UPDATE/DELETE policies for admins
    - Need predefined challenge categories

  2. Solutions
    - Add admin RLS policies for sfx table
    - Add admin RLS policies for animations table
    - Create 6 predefined challenge categories with at least 3 questions each

  3. Predefined Challenge Categories
    - Word Ordering (Level 1)
    - Picture Matching (Level 1)
    - Letter Arrangement (Level 2)
    - Crossword Puzzle (Level 2)
    - Virtues Quiz (Level 3)
    - Hadith Arrangement (Level 3)
*/

-- Add admin policies for sfx table
CREATE POLICY "Admins can insert sfx"
  ON sfx FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update sfx"
  ON sfx FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete sfx"
  ON sfx FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add admin policies for animations table
CREATE POLICY "Admins can insert animations"
  ON animations FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update animations"
  ON animations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete animations"
  ON animations FOR DELETE
  TO authenticated
  USING (is_admin());

-- Create predefined challenge categories
INSERT INTO challenge_categories (id, name, level, pass_percentage, is_published)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Word Ordering', 1, 70, true),
  ('22222222-2222-2222-2222-222222222222', 'Picture Matching', 1, 70, true),
  ('33333333-3333-3333-3333-333333333333', 'Letter Arrangement', 2, 75, true),
  ('44444444-4444-4444-4444-444444444444', 'Crossword Puzzle', 2, 75, true),
  ('55555555-5555-5555-5555-555555555555', 'Virtues Quiz', 3, 80, true),
  ('66666666-6666-6666-6666-666666666666', 'Hadith Arrangement', 3, 80, true)
ON CONFLICT (id) DO NOTHING;

-- Word Ordering questions (Level 1)
INSERT INTO challenge_questions (category_id, type, question, options, answer, time_limit_sec, order_index)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'word_ordering', 'Arrange the words to complete the Shahada', 
   '{"words": ["There", "is", "no", "god", "but", "Allah", "and", "Muhammad", "is", "His", "messenger"]}'::jsonb,
   '{"correct_order": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}'::jsonb,
   60, 1),
  ('11111111-1111-1111-1111-111111111111', 'word_ordering', 'Put these words in order: The first pillar of Islam',
   '{"words": ["The", "Shahada", "is", "the", "first", "pillar", "of", "Islam"]}'::jsonb,
   '{"correct_order": [0, 1, 2, 3, 4, 5, 6, 7]}'::jsonb,
   45, 2),
  ('11111111-1111-1111-1111-111111111111', 'word_ordering', 'Arrange: Muslims pray five times a day',
   '{"words": ["Muslims", "pray", "five", "times", "a", "day"]}'::jsonb,
   '{"correct_order": [0, 1, 2, 3, 4, 5]}'::jsonb,
   30, 3)
ON CONFLICT DO NOTHING;

-- Picture Matching questions (Level 1)
INSERT INTO challenge_questions (category_id, type, question, options, answer, time_limit_sec, order_index)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'word_to_image_match', 'Match the Islamic terms with their images',
   '{"words": ["Kaaba", "Quran", "Prayer Mat"], "images": ["kaaba.jpg", "quran.jpg", "prayer_mat.jpg"]}'::jsonb,
   '{"pairs": [[0, 0], [1, 1], [2, 2]]}'::jsonb,
   60, 1),
  ('22222222-2222-2222-2222-222222222222', 'word_to_image_match', 'Match the prayer positions',
   '{"words": ["Standing", "Bowing", "Prostrating"], "images": ["standing.jpg", "ruku.jpg", "sujood.jpg"]}'::jsonb,
   '{"pairs": [[0, 0], [1, 1], [2, 2]]}'::jsonb,
   60, 2),
  ('22222222-2222-2222-2222-222222222222', 'word_to_image_match', 'Match the pillars of Islam',
   '{"words": ["Shahada", "Salah", "Zakat"], "images": ["shahada.jpg", "salah.jpg", "zakat.jpg"]}'::jsonb,
   '{"pairs": [[0, 0], [1, 1], [2, 2]]}'::jsonb,
   60, 3)
ON CONFLICT DO NOTHING;

-- Letter Arrangement questions (Level 2)
INSERT INTO challenge_questions (category_id, type, question, options, answer, time_limit_sec, order_index)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'letter_arrangement', 'Arrange the letters to spell a pillar of Islam',
   '{"letters": ["S", "A", "L", "A", "H"], "hint": "Prayer in Arabic"}'::jsonb,
   '{"correct_word": "SALAH"}'::jsonb,
   45, 1),
  ('33333333-3333-3333-3333-333333333333', 'letter_arrangement', 'Unscramble this Islamic term',
   '{"letters": ["Z", "A", "K", "A", "T"], "hint": "Charity in Islam"}'::jsonb,
   '{"correct_word": "ZAKAT"}'::jsonb,
   45, 2),
  ('33333333-3333-3333-3333-333333333333', 'letter_arrangement', 'Arrange these letters',
   '{"letters": ["Q", "U", "R", "A", "N"], "hint": "Holy Book"}'::jsonb,
   '{"correct_word": "QURAN"}'::jsonb,
   45, 3)
ON CONFLICT DO NOTHING;

-- Crossword Puzzle questions (Level 2)
INSERT INTO challenge_questions (category_id, type, question, options, answer, time_limit_sec, order_index)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'crossword', 'Complete the crossword: Islamic terms',
   '{"clues": {"across": {"1": "The holy month of fasting"}, "down": {"1": "Direction of prayer"}}, "grid_size": [5, 5]}'::jsonb,
   '{"words": {"1_across": "RAMADAN", "1_down": "QIBLA"}}'::jsonb,
   90, 1),
  ('44444444-4444-4444-4444-444444444444', 'crossword', 'Fill in the Islamic crossword',
   '{"clues": {"across": {"1": "Prophet of Islam"}, "down": {"1": "Holy book"}}, "grid_size": [5, 5]}'::jsonb,
   '{"words": {"1_across": "MUHAMMAD", "1_down": "QURAN"}}'::jsonb,
   90, 2),
  ('44444444-4444-4444-4444-444444444444', 'crossword', 'Islamic terms crossword',
   '{"clues": {"across": {"1": "House of Allah"}, "down": {"1": "Islamic pilgrimage"}}, "grid_size": [5, 5]}'::jsonb,
   '{"words": {"1_across": "KAABA", "1_down": "HAJJ"}}'::jsonb,
   90, 3)
ON CONFLICT DO NOTHING;

-- Virtues Quiz questions (Level 3)
INSERT INTO challenge_questions (category_id, type, question, options, answer, time_limit_sec, order_index)
VALUES
  ('55555555-5555-5555-5555-555555555555', 'multiple_choice', 'What is the most important virtue in Islam?',
   '{"choices": ["Patience", "Honesty", "Taqwa (God-consciousness)", "Generosity"]}'::jsonb,
   '{"correct": 2}'::jsonb,
   30, 1),
  ('55555555-5555-5555-5555-555555555555', 'multiple_choice', 'Which virtue did Prophet Muhammad emphasize the most?',
   '{"choices": ["Wealth", "Good character", "Physical strength", "Intelligence"]}'::jsonb,
   '{"correct": 1}'::jsonb,
   30, 2),
  ('55555555-5555-5555-5555-555555555555', 'multiple_choice', 'What does Sabr mean in Islam?',
   '{"choices": ["Charity", "Patience", "Prayer", "Fasting"]}'::jsonb,
   '{"correct": 1}'::jsonb,
   30, 3)
ON CONFLICT DO NOTHING;

-- Hadith Arrangement questions (Level 3)
INSERT INTO challenge_questions (category_id, type, question, options, answer, time_limit_sec, order_index)
VALUES
  ('66666666-6666-6666-6666-666666666666', 'word_ordering', 'Arrange this famous Hadith correctly',
   '{"words": ["The", "best", "among", "you", "are", "those", "who", "have", "the", "best", "manners"]}'::jsonb,
   '{"correct_order": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}'::jsonb,
   60, 1),
  ('66666666-6666-6666-6666-666666666666', 'word_ordering', 'Put this Hadith in order',
   '{"words": ["Actions", "are", "judged", "by", "intentions"]}'::jsonb,
   '{"correct_order": [0, 1, 2, 3, 4]}'::jsonb,
   45, 2),
  ('66666666-6666-6666-6666-666666666666', 'word_ordering', 'Arrange the Hadith about smiling',
   '{"words": ["Smiling", "in", "the", "face", "of", "your", "brother", "is", "charity"]}'::jsonb,
   '{"correct_order": [0, 1, 2, 3, 4, 5, 6, 7, 8]}'::jsonb,
   50, 3)
ON CONFLICT DO NOTHING;
