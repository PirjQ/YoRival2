/*
  # Add unique constraint for generated_smacks upsert operations

  1. Changes
    - Add unique constraint on (debate_id, user_id) to support upsert operations
    - This allows us to replace existing zingers instead of creating duplicates

  2. Security
    - No changes to RLS policies needed
*/

-- Add unique constraint to support upsert operations
ALTER TABLE generated_smacks 
ADD CONSTRAINT generated_smacks_debate_user_unique 
UNIQUE (debate_id, user_id);