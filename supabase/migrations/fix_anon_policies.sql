/*
  # Fix RLS Policies untuk Anon Users
  
  Migration ini memperbaiki RLS policies untuk mengizinkan anon users
  melakukan operasi INSERT, UPDATE, dan DELETE pada tabel:
  - layanan
  - pelanggan  
  - transaksi
  
  Hal ini diperlukan karena aplikasi tidak menggunakan autentikasi Supabase
  dan hanya menggunakan anon key untuk akses database.
*/

-- Drop existing authenticated-only policies untuk layanan
DROP POLICY IF EXISTS "Authenticated users can view layanan" ON layanan;
DROP POLICY IF EXISTS "Authenticated users can insert layanan" ON layanan;
DROP POLICY IF EXISTS "Authenticated users can update layanan" ON layanan;
DROP POLICY IF EXISTS "Authenticated users can delete layanan" ON layanan;

-- Create new policies untuk layanan (allow anon users)
CREATE POLICY "Anyone can view layanan"
  ON layanan FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert layanan"
  ON layanan FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update layanan"
  ON layanan FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete layanan"
  ON layanan FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop existing authenticated-only policies untuk pelanggan
DROP POLICY IF EXISTS "Authenticated users can view pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Authenticated users can insert pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Authenticated users can update pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Authenticated users can delete pelanggan" ON pelanggan;

-- Create new policies untuk pelanggan (allow anon users)
CREATE POLICY "Anyone can view pelanggan"
  ON pelanggan FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert pelanggan"
  ON pelanggan FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update pelanggan"
  ON pelanggan FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete pelanggan"
  ON pelanggan FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop existing authenticated-only policies untuk transaksi
DROP POLICY IF EXISTS "Authenticated users can view transaksi" ON transaksi;
DROP POLICY IF EXISTS "Authenticated users can insert transaksi" ON transaksi;
DROP POLICY IF EXISTS "Authenticated users can update transaksi" ON transaksi;
DROP POLICY IF EXISTS "Authenticated users can delete transaksi" ON transaksi;
DROP POLICY IF EXISTS "Anyone can view transaksi for status checking" ON transaksi;

-- Create new policies untuk transaksi (allow anon users)
CREATE POLICY "Anyone can view transaksi"
  ON transaksi FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert transaksi"
  ON transaksi FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update transaksi"
  ON transaksi FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete transaksi"
  ON transaksi FOR DELETE
  TO anon, authenticated
  USING (true);

