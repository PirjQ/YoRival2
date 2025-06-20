/*
  # Add upsert function for generated smacks

  1. New Functions
    - `upsert_generated_smack` - Safely insert or update generated smacks
  
  2. Purpose
    - Handles the case where a user generates multiple smacks for the same debate
    - Uses PostgreSQL's ON CONFLICT clause for atomic upsert operations
*/

-- Create the upsert function for generated smacks
CREATE OR REPLACE FUNCTION upsert_generated_smack(
  p_debate_id uuid,
  p_user_id uuid,
  p_smack_text text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO generated_smacks (debate_id, user_id, smack_text)
  VALUES (p_debate_id, p_user_id, p_smack_text)
  ON CONFLICT (debate_id, user_id)
  DO UPDATE SET 
    smack_text = EXCLUDED.smack_text,
    created_at = now();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_generated_smack(uuid, uuid, text) TO authenticated;