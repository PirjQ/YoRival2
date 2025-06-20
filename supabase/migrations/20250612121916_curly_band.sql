/*
  # Create generated_smacks table

  1. New Tables
    - `generated_smacks`
      - `id` (uuid, primary key)
      - `debate_id` (uuid, foreign key to debates)
      - `user_id` (uuid, foreign key to profiles)
      - `smack_text` (text, not null)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `generated_smacks` table
    - Add policy for users to read their own smacks
    - Add policy for users to insert their own smacks
    - Add policy for public read access to smacks

  3. Changes
    - Remove `has_generated_smack` column from votes table as it's no longer needed
    - Add vote count columns to debates table for better performance
*/

-- Create generated_smacks table
CREATE TABLE IF NOT EXISTS generated_smacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id uuid REFERENCES debates(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  smack_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(debate_id, user_id)
);

-- Add vote count columns to debates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'debates' AND column_name = 'side_a_count'
  ) THEN
    ALTER TABLE debates ADD COLUMN side_a_count integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'debates' AND column_name = 'side_b_count'
  ) THEN
    ALTER TABLE debates ADD COLUMN side_b_count integer DEFAULT 0;
  END IF;
END $$;

-- Remove has_generated_smack column from votes table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'votes' AND column_name = 'has_generated_smack'
  ) THEN
    ALTER TABLE votes DROP COLUMN has_generated_smack;
  END IF;
END $$;

-- Enable RLS on generated_smacks
ALTER TABLE generated_smacks ENABLE ROW LEVEL SECURITY;

-- Policies for generated_smacks
CREATE POLICY "Anyone can read generated smacks"
  ON generated_smacks
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert their own smacks"
  ON generated_smacks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_debate_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment the appropriate side count
    IF NEW.chosen_side = 'A' THEN
      UPDATE debates 
      SET side_a_count = side_a_count + 1 
      WHERE id = NEW.debate_id;
    ELSE
      UPDATE debates 
      SET side_b_count = side_b_count + 1 
      WHERE id = NEW.debate_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement the appropriate side count
    IF OLD.chosen_side = 'A' THEN
      UPDATE debates 
      SET side_a_count = side_a_count - 1 
      WHERE id = OLD.debate_id;
    ELSE
      UPDATE debates 
      SET side_b_count = side_b_count - 1 
      WHERE id = OLD.debate_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update vote counts
DROP TRIGGER IF EXISTS trigger_update_debate_vote_counts ON votes;
CREATE TRIGGER trigger_update_debate_vote_counts
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_debate_vote_counts();

-- Initialize vote counts for existing debates
UPDATE debates 
SET 
  side_a_count = (
    SELECT COUNT(*) 
    FROM votes 
    WHERE votes.debate_id = debates.id AND votes.chosen_side = 'A'
  ),
  side_b_count = (
    SELECT COUNT(*) 
    FROM votes 
    WHERE votes.debate_id = debates.id AND votes.chosen_side = 'B'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_smacks_debate_id ON generated_smacks(debate_id);
CREATE INDEX IF NOT EXISTS idx_generated_smacks_user_id ON generated_smacks(user_id);