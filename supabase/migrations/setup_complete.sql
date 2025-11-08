/*
  # Setup Complete Database Schema untuk Laundry Management
  
  File ini berisi SEMUA SQL yang diperlukan untuk setup database.
  Jalankan file ini SEKALI untuk membuat semua tabel dan policies.
  
  INSTRUKSI:
  1. Buka Supabase Dashboard > SQL Editor
  2. Copy SEMUA isi file ini
  3. Paste ke SQL Editor
  4. Klik "Run" untuk menjalankan
  5. Pastikan tidak ada error (harus muncul "Success. No rows returned")
*/

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  name text NOT NULL,
  alamat text DEFAULT '',
  password text NOT NULL,
  nomor_hp text DEFAULT '',
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create layanan table
CREATE TABLE IF NOT EXISTS layanan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  jenis_layanan text NOT NULL CHECK (jenis_layanan IN ('kiloan', 'satuan')),
  harga integer NOT NULL DEFAULT 0,
  durasi_pengerjaan_jam integer NOT NULL DEFAULT 24,
  created_at timestamptz DEFAULT now()
);

-- Create pelanggan table
CREATE TABLE IF NOT EXISTS pelanggan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nomor_hp text NOT NULL,
  alamat text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create transaksi table
CREATE TABLE IF NOT EXISTS transaksi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_struk text UNIQUE NOT NULL,
  id_pelanggan uuid REFERENCES pelanggan(id) ON DELETE SET NULL,
  id_users uuid REFERENCES users(id) ON DELETE SET NULL,
  id_layanan uuid REFERENCES layanan(id) ON DELETE SET NULL,
  nama_layanan text NOT NULL,
  nama_pelanggan text NOT NULL,
  alamat_pelanggan text DEFAULT '',
  jumlah integer NOT NULL DEFAULT 1,
  harga_layanan integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  status_transaksi text NOT NULL DEFAULT 'antrian' CHECK (status_transaksi IN ('antrian', 'proses', 'selesai')),
  status_pembayaran text NOT NULL DEFAULT 'belum_lunas' CHECK (status_pembayaran IN ('belum_lunas', 'lunas')),
  deadline timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE layanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. DROP OLD POLICIES (if exist)
-- ============================================

-- Drop old policies untuk layanan
DROP POLICY IF EXISTS "Authenticated users can view layanan" ON layanan;
DROP POLICY IF EXISTS "Authenticated users can insert layanan" ON layanan;
DROP POLICY IF EXISTS "Authenticated users can update layanan" ON layanan;
DROP POLICY IF EXISTS "Authenticated users can delete layanan" ON layanan;
DROP POLICY IF EXISTS "Anyone can view layanan" ON layanan;
DROP POLICY IF EXISTS "Anyone can insert layanan" ON layanan;
DROP POLICY IF EXISTS "Anyone can update layanan" ON layanan;
DROP POLICY IF EXISTS "Anyone can delete layanan" ON layanan;

-- Drop old policies untuk pelanggan
DROP POLICY IF EXISTS "Authenticated users can view pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Authenticated users can insert pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Authenticated users can update pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Authenticated users can delete pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Anyone can view pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Anyone can insert pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Anyone can update pelanggan" ON pelanggan;
DROP POLICY IF EXISTS "Anyone can delete pelanggan" ON pelanggan;

-- Drop old policies untuk transaksi
DROP POLICY IF EXISTS "Authenticated users can view transaksi" ON transaksi;
DROP POLICY IF EXISTS "Authenticated users can insert transaksi" ON transaksi;
DROP POLICY IF EXISTS "Authenticated users can update transaksi" ON transaksi;
DROP POLICY IF EXISTS "Authenticated users can delete transaksi" ON transaksi;
DROP POLICY IF EXISTS "Anyone can view transaksi for status checking" ON transaksi;
DROP POLICY IF EXISTS "Anyone can view transaksi" ON transaksi;
DROP POLICY IF EXISTS "Anyone can insert transaksi" ON transaksi;
DROP POLICY IF EXISTS "Anyone can update transaksi" ON transaksi;
DROP POLICY IF EXISTS "Anyone can delete transaksi" ON transaksi;

-- ============================================
-- 4. CREATE RLS POLICIES (Allow Anon Users)
-- ============================================

-- Policies untuk layanan (allow anon users)
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

-- Policies untuk pelanggan (allow anon users)
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

-- Policies untuk transaksi (allow anon users)
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

-- Policies untuk users (keep authenticated only)
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 5. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_transaksi_kode_struk ON transaksi(kode_struk);
CREATE INDEX IF NOT EXISTS idx_transaksi_status ON transaksi(status_transaksi);
CREATE INDEX IF NOT EXISTS idx_transaksi_created_at ON transaksi(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pelanggan_nomor_hp ON pelanggan(nomor_hp);

-- ============================================
-- 6. VERIFY TABLES CREATED
-- ============================================

-- Query untuk memverifikasi tabel sudah dibuat
-- (Ini hanya untuk verifikasi, tidak akan mempengaruhi setup)
DO $$
BEGIN
  RAISE NOTICE 'Setup selesai! Tabel yang dibuat:';
  RAISE NOTICE '- users';
  RAISE NOTICE '- layanan';
  RAISE NOTICE '- pelanggan';
  RAISE NOTICE '- transaksi';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies sudah dikonfigurasi untuk anon users.';
  RAISE NOTICE 'Indexes sudah dibuat.';
END $$;

