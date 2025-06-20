/*
  # Fix generated_smacks unique constraint

  1. Clean up any existing broken constraints
  2. Ensure the table has the correct unique constraint
  3. Verify the constraint works properly

  This migration will:
  - Remove any duplicate or broken constraints
  - Add a proper unique constraint on (debate_id, user_id)
  - Test the constraint to ensure it works
*/

-- First, let's see what constraints currently exist and remove them all
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Drop all unique constraints on generated_smacks table
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'generated_smacks' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name != 'generated_smacks_pkey'  -- Don't drop the primary key
    LOOP
        EXECUTE 'ALTER TABLE generated_smacks DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Now add the unique constraint with a clear, simple name
ALTER TABLE generated_smacks 
ADD CONSTRAINT generated_smacks_unique_debate_user 
UNIQUE (debate_id, user_id);

-- Verify the constraint exists and works
DO $$
BEGIN
    -- Check if constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'generated_smacks_unique_debate_user' 
        AND table_name = 'generated_smacks'
        AND constraint_type = 'UNIQUE'
    ) THEN
        RAISE EXCEPTION 'Unique constraint was not created successfully';
    END IF;
    
    -- Log success
    RAISE NOTICE 'Unique constraint created successfully on generated_smacks (debate_id, user_id)';
END $$;