-- Drop old policies that restrict to authenticated auth.uid()
DROP POLICY IF EXISTS "Users can read own data" ON users_laundry;
DROP POLICY IF EXISTS "Users can update own data" ON users_laundry;

-- Create new policies allowing public (anon + authenticated) select, insert, update
CREATE POLICY "Anyone can view users_laundry"
  ON users_laundry FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert users_laundry"
  ON users_laundry FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update users_laundry"
  ON users_laundry FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Update seeded admin password to plain-text so client can check it directly
UPDATE users_laundry
SET password = 'admin123'
WHERE username = 'admin';


