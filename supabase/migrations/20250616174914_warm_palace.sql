/*
  # Fix unique constraint for generated_smacks table

  1. Clean up any existing constraints
  2. Add the proper unique constraint
  3. Ensure upsert functionality works correctly

  This migration will:
  - Drop any existing duplicate constraints
  - Add the constraint cleanly with proper naming
  - Verify the constraint exists for upsert operations
*/

-- First, drop any existing constraints that might be duplicated
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop all unique constraints on (debate_id, user_id)
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'generated_smacks' 
        AND tc.constraint_type = 'UNIQUE'
        AND EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage ccu2 
            WHERE ccu2.constraint_name = tc.constraint_name 
            AND ccu2.column_name IN ('debate_id', 'user_id')
            GROUP BY ccu2.constraint_name 
            HAVING COUNT(*) = 2
        )
    LOOP
        EXECUTE 'ALTER TABLE generated_smacks DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Now add the unique constraint with a clear name
ALTER TABLE generated_smacks 
ADD CONSTRAINT unique_generated_smacks_debate_user 
UNIQUE (debate_id, user_id);

-- Verify the constraint was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_generated_smacks_debate_user' 
        AND table_name = 'generated_smacks'
        AND constraint_type = 'UNIQUE'
    ) THEN
        RAISE EXCEPTION 'Failed to create unique constraint on generated_smacks table';
    END IF;
END $$;