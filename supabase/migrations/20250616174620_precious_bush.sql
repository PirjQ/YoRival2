/*
  # Fix unique constraint for generated_smacks table

  1. Changes
    - Drop any existing constraints that might be duplicated
    - Add the proper unique constraint for upsert operations
    - Ensure the constraint name is consistent

  2. Security
    - No changes to RLS policies
*/

-- Drop the constraint if it exists (in case of duplicates)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'generated_smacks_debate_user_unique' 
    AND table_name = 'generated_smacks'
  ) THEN
    ALTER TABLE generated_smacks DROP CONSTRAINT generated_smacks_debate_user_unique;
  END IF;
END $$;

-- Add the unique constraint properly
ALTER TABLE generated_smacks 
ADD CONSTRAINT generated_smacks_debate_user_unique 
UNIQUE (debate_id, user_id);