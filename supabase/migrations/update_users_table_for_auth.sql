/*
  # Update Users Table untuk Supabase Auth
  
  Migration ini mengupdate tabel users untuk kompatibel dengan Supabase Auth.
  - id akan menggunakan UUID dari auth.users
  - password tidak diperlukan (handled by Supabase Auth)
  - username optional (bisa menggunakan email)
*/

-- Update users table structure
-- Drop NOT NULL constraint on password (tidak diperlukan dengan Supabase Auth)
ALTER TABLE users 
  ALTER COLUMN password DROP NOT NULL,
  ALTER COLUMN password SET DEFAULT '';

-- Make username optional (default to email prefix)
ALTER TABLE users 
  ALTER COLUMN username DROP NOT NULL;

-- Add constraint to ensure id matches auth.users (optional, but good practice)
-- Note: This requires the user to exist in auth.users first

-- Update RLS policies untuk users table
DROP POLICY IF EXISTS "Authenticated users can view users" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Allow authenticated users to view all users (for profile display)
CREATE POLICY "Authenticated users can view users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

