/*
  # Add image_url to lesson_categories

  Adds image_url column to lesson_categories table to store category images.
  
  Changes:
  - Add image_url column (text, nullable)
*/

ALTER TABLE lesson_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;