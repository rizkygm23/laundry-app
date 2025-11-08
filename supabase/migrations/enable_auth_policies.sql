/*
  # Enable Auth Policies untuk Supabase Auth
  
  Migration ini mengupdate RLS policies untuk menggunakan Supabase Auth.
  Setelah migration ini, hanya authenticated users yang bisa mengakses data.
  
  PENTING: Jalankan migration ini SETELAH users sudah terdaftar via Supabase Auth.
*/

-- Update policies untuk layanan (only authenticated users)
DROP POLICY IF EXISTS "Anyone can view layanan" ON layanan;
DROP POLICY IF EXISTS "Anyone can insert layanan" ON layanan;
DROP POLICY IF EXISTS "Anyone can update layanan" ON layanan;
DROP POLICY IF EXISTS "Anyone can delete layanan" ON layanan;

CREATE POLICY "Authenticated users can view layanan"
  ON layanan FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert layanan"
  ON layanan FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update layanan"
  ON layanan FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete layanan"
  ON layanan FOR DELETE
  TO authenticated
  USING (true);

-- Update policies untuk pelanggan (only authenticated users)
DROP POLICY IF EXISTS "Anyone can view pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Anyone can insert pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Anyone can update pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Anyone can delete pelanggan" ON pelanggan;

CREATE POLICY "Authenticated users can view pelanggan"
  ON pelanggan FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert pelanggan"
  ON pelanggan FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pelanggan"
  ON pelanggan FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete pelanggan"
  ON pelanggan FOR DELETE
  TO authenticated
  USING (true);

-- Update policies untuk transaksi
DROP POLICY IF EXISTS "Anyone can view transaksi" ON transaksi;
DROP POLICY IF EXISTS "Anyone can insert transaksi" ON transaksi;
DROP POLICY IF EXISTS "Anyone can update transaksi" ON transaksi;
DROP POLICY IF EXISTS "Anyone can delete transaksi" ON transaksi;

-- Authenticated users can manage transaksi
CREATE POLICY "Authenticated users can view transaksi"
  ON transaksi FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transaksi"
  ON transaksi FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update transaksi"
  ON transaksi FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete transaksi"
  ON transaksi FOR DELETE
  TO authenticated
  USING (true);

-- Public policy untuk checking transaction status (no auth required)
-- Ini penting untuk halaman status public
CREATE POLICY "Anyone can view transaksi for status checking"
  ON transaksi FOR SELECT
  TO anon
  USING (true);

-- Update users table policies
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Allow authenticated users to read all users (for profile display)
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

