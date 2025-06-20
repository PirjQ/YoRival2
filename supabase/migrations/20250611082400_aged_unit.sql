/*
  # DebateSpark Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique, not null)
      - `created_at` (timestamp)
    - `debates`
      - `id` (uuid, primary key)
      - `topic` (text, not null)
      - `side_a_name` (text, not null)
      - `side_b_name` (text, not null)
      - `creator_id` (uuid, foreign key to profiles)
      - `created_at` (timestamp)
    - `votes`
      - `id` (uuid, primary key)
      - `debate_id` (uuid, foreign key to debates)
      - `user_id` (uuid, foreign key to profiles)
      - `chosen_side` (text, 'A' or 'B')
      - `has_generated_smack` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to debates and vote counts
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create debates table
CREATE TABLE IF NOT EXISTS debates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  side_a_name text NOT NULL,
  side_b_name text NOT NULL,
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id uuid REFERENCES debates(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  chosen_side text NOT NULL CHECK (chosen_side IN ('A', 'B')),
  has_generated_smack boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(debate_id, user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Debates policies
CREATE POLICY "Anyone can read debates"
  ON debates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create debates"
  ON debates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Votes policies
CREATE POLICY "Anyone can read votes"
  ON votes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert their own votes"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_debates_creator_id ON debates(creator_id);
CREATE INDEX IF NOT EXISTS idx_votes_debate_id ON votes(debate_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);