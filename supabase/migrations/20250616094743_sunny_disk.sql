/*
  # Add unique constraint for generated_smacks

  1. Changes
    - Add unique constraint on (debate_id, user_id) to support upsert operations
    - This allows users to generate unlimited zingers with overwrites

  2. Security
    - No changes to existing RLS policies
*/

-- Add unique constraint to support upsert operations
ALTER TABLE generated_smacks 
ADD CONSTRAINT generated_smacks_debate_user_unique 
UNIQUE (debate_id, user_id);