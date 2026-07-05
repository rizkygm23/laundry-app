/*
  # Setup Complete Database Schema untuk Laundry Management
  
  File ini berisi SEMUA SQL yang diperlukan untuk setup database dengan tabel
  yang sudah diberi suffix `_laundry`.
  
  INSTRUKSI:
  1. Buka Supabase Dashboard > SQL Editor
  2. Copy SEMUA isi file ini
  3. Paste ke SQL Editor
  4. Klik "Run" untuk menjalankan
  5. Pastikan tidak ada error (harus muncul "Success. No rows returned")
  
  CATATAN:
  File ini akan menghapus tabel `_laundry` yang sudah ada dan membuat ulang.
  Pastikan data penting sudah di-backup sebelum dijalankan.
*/

-- ============================================
-- 0. DROP EXISTING TABLES (fresh setup)
-- ============================================

DROP TABLE IF EXISTS transaksi_laundry CASCADE;
DROP TABLE IF EXISTS pengeluaran_laundry CASCADE;
DROP TABLE IF EXISTS outlet_settings_laundry CASCADE;
DROP TABLE IF EXISTS pelanggan_laundry CASCADE;
DROP TABLE IF EXISTS layanan_laundry CASCADE;
DROP TABLE IF EXISTS users_laundry CASCADE;

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Create users_laundry table
CREATE TABLE IF NOT EXISTS users_laundry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  name text NOT NULL,
  alamat text DEFAULT '',
  password text NOT NULL,
  salt text NOT NULL,
  nomor_hp text DEFAULT '',
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE users_laundry IS 'Tabel untuk menyimpan data pengguna/admin sistem laundry';

-- Create layanan_laundry table
CREATE TABLE IF NOT EXISTS layanan_laundry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  jenis_layanan text NOT NULL CHECK (jenis_layanan IN ('kiloan', 'satuan')),
  harga integer NOT NULL DEFAULT 0,
  durasi_pengerjaan_jam integer NOT NULL DEFAULT 24,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE layanan_laundry IS 'Tabel untuk menyimpan daftar layanan laundry (kiloan/satuan)';

-- Create pelanggan_laundry table
CREATE TABLE IF NOT EXISTS pelanggan_laundry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nomor_hp text NOT NULL,
  alamat text DEFAULT '',
  poin integer DEFAULT 0,
  membership_level text DEFAULT 'Bronze',
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE pelanggan_laundry IS 'Tabel untuk menyimpan data pelanggan laundry';

-- Create transaksi_laundry table
CREATE TABLE IF NOT EXISTS transaksi_laundry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_struk text NOT NULL,
  id_pelanggan uuid REFERENCES pelanggan_laundry(id) ON DELETE SET NULL,
  id_users uuid REFERENCES users_laundry(id) ON DELETE SET NULL,
  id_layanan uuid REFERENCES layanan_laundry(id) ON DELETE SET NULL,
  nama_layanan text NOT NULL,
  nama_pelanggan text NOT NULL,
  nomor_hp text,
  alamat_pelanggan text DEFAULT '',
  jumlah integer NOT NULL DEFAULT 1,
  harga_layanan integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  status_transaksi text NOT NULL DEFAULT 'antrian' CHECK (status_transaksi IN ('antrian', 'proses', 'selesai', 'penjemputan', 'terkirim')),
  status_pembayaran text NOT NULL DEFAULT 'belum_lunas' CHECK (status_pembayaran IN ('belum_lunas', 'lunas')),
  metode_pembayaran text CHECK (metode_pembayaran IN ('tunai', 'transfer', 'e_wallet', 'qris')),
  bukti_pembayaran_url text,
  poin_earned integer DEFAULT 0,
  poin_used integer DEFAULT 0,
  latitude double precision,
  longitude double precision,
  jarak_km decimal(10, 2),
  ongkos_kirim integer DEFAULT 0,
  deadline timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE transaksi_laundry IS 'Tabel untuk menyimpan transaksi laundry';

-- Create pengeluaran_laundry table
CREATE TABLE IF NOT EXISTS pengeluaran_laundry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_users uuid REFERENCES users_laundry(id) ON DELETE SET NULL,
  kategori text NOT NULL,
  deskripsi text NOT NULL,
  jumlah integer NOT NULL DEFAULT 0,
  tanggal timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE pengeluaran_laundry IS 'Tabel untuk mencatat pengeluaran usaha laundry';

-- Create outlet_settings_laundry table
CREATE TABLE IF NOT EXISTS outlet_settings_laundry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE outlet_settings_laundry IS 'Tabel untuk menyimpan pengaturan lokasi outlet laundry';

-- Insert default outlet location if table is empty
INSERT INTO outlet_settings_laundry (latitude, longitude, address)
SELECT -6.175392, 106.827153, 'Monas, Jakarta Pusat'
WHERE NOT EXISTS (SELECT 1 FROM outlet_settings_laundry);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users_laundry ENABLE ROW LEVEL SECURITY;
ALTER TABLE layanan_laundry ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan_laundry ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_laundry ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengeluaran_laundry ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlet_settings_laundry ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. DROP OLD POLICIES (if exist)
-- ============================================

-- Policies for users_laundry
DROP POLICY IF EXISTS "Users can read own data" ON users_laundry;
DROP POLICY IF EXISTS "Users can update own data" ON users_laundry;
DROP POLICY IF EXISTS "Authenticated users can view users" ON users_laundry;
DROP POLICY IF EXISTS "Users can insert own profile" ON users_laundry;
DROP POLICY IF EXISTS "Users can update own profile" ON users_laundry;

-- Policies for layanan_laundry
DROP POLICY IF EXISTS "Authenticated users can view layanan_laundry" ON layanan_laundry;
DROP POLICY IF EXISTS "Authenticated users can insert layanan_laundry" ON layanan_laundry;
DROP POLICY IF EXISTS "Authenticated users can update layanan_laundry" ON layanan_laundry;
DROP POLICY IF EXISTS "Authenticated users can delete layanan_laundry" ON layanan_laundry;
DROP POLICY IF EXISTS "Anyone can view layanan_laundry" ON layanan_laundry;
DROP POLICY IF EXISTS "Anyone can insert layanan_laundry" ON layanan_laundry;
DROP POLICY IF EXISTS "Anyone can update layanan_laundry" ON layanan_laundry;
DROP POLICY IF EXISTS "Anyone can delete layanan_laundry" ON layanan_laundry;
DROP POLICY IF EXISTS "Anyone can view layanan" ON layanan_laundry;
DROP POLICY IF EXISTS "Anyone can insert layanan" ON layanan_laundry;
DROP POLICY IF EXISTS "Anyone can update layanan" ON layanan_laundry;
DROP POLICY IF EXISTS "Anyone can delete layanan" ON layanan_laundry;

-- Policies for pelanggan_laundry
DROP POLICY IF EXISTS "Authenticated users can view pelanggan_laundry" ON pelanggan_laundry;
DROP POLICY IF EXISTS "Authenticated users can insert pelanggan_laundry" ON pelanggan_laundry;
DROP POLICY IF EXISTS "Authenticated users can update pelanggan_laundry" ON pelanggan_laundry;
DROP POLICY IF EXISTS "Authenticated users can delete pelanggan_laundry" ON pelanggan_laundry;
DROP POLICY IF EXISTS "Anyone can view pelanggan_laundry" ON pelanggan_laundry;
DROP POLICY IF EXISTS "Anyone can insert pelanggan_laundry" ON pelanggan_laundry;
DROP POLICY IF EXISTS "Anyone can update pelanggan_laundry" ON pelanggan_laundry;
DROP POLICY IF EXISTS "Anyone can delete pelanggan_laundry" ON pelanggan_laundry;
DROP POLICY IF EXISTS "Anyone can view pelanggan" ON pelanggan_laundry;
DROP POLICY IF EXISTS "Anyone can insert pelanggan" ON pelanggan_laundry;
DROP POLICY IF EXISTS "Anyone can update pelanggan" ON pelanggan_laundry;
DROP POLICY IF EXISTS "Anyone can delete pelanggan" ON pelanggan_laundry;

-- Policies for transaksi_laundry
DROP POLICY IF EXISTS "Authenticated users can view transaksi_laundry" ON transaksi_laundry;
DROP POLICY IF EXISTS "Authenticated users can insert transaksi_laundry" ON transaksi_laundry;
DROP POLICY IF EXISTS "Authenticated users can update transaksi_laundry" ON transaksi_laundry;
DROP POLICY IF EXISTS "Authenticated users can delete transaksi_laundry" ON transaksi_laundry;
DROP POLICY IF EXISTS "Anyone can view transaksi_laundry" ON transaksi_laundry;
DROP POLICY IF EXISTS "Anyone can insert transaksi_laundry" ON transaksi_laundry;
DROP POLICY IF EXISTS "Anyone can update transaksi_laundry" ON transaksi_laundry;
DROP POLICY IF EXISTS "Anyone can delete transaksi_laundry" ON transaksi_laundry;
DROP POLICY IF EXISTS "Anyone can view transaksi for status checking" ON transaksi_laundry;
DROP POLICY IF EXISTS "Anyone can view transaksi" ON transaksi_laundry;
DROP POLICY IF EXISTS "Anyone can insert transaksi" ON transaksi_laundry;
DROP POLICY IF EXISTS "Anyone can update transaksi" ON transaksi_laundry;
DROP POLICY IF EXISTS "Anyone can delete transaksi" ON transaksi_laundry;

-- Policies for pengeluaran_laundry
DROP POLICY IF EXISTS "Anyone can view pengeluaran_laundry" ON pengeluaran_laundry;
DROP POLICY IF EXISTS "Anyone can insert pengeluaran_laundry" ON pengeluaran_laundry;
DROP POLICY IF EXISTS "Anyone can update pengeluaran_laundry" ON pengeluaran_laundry;
DROP POLICY IF EXISTS "Anyone can delete pengeluaran_laundry" ON pengeluaran_laundry;
DROP POLICY IF EXISTS "Anyone can view pengeluaran" ON pengeluaran_laundry;
DROP POLICY IF EXISTS "Anyone can insert pengeluaran" ON pengeluaran_laundry;
DROP POLICY IF EXISTS "Anyone can update pengeluaran" ON pengeluaran_laundry;
DROP POLICY IF EXISTS "Anyone can delete pengeluaran" ON pengeluaran_laundry;

-- Policies for outlet_settings_laundry
DROP POLICY IF EXISTS "Public can read outlet settings_laundry" ON outlet_settings_laundry;
DROP POLICY IF EXISTS "Admins can update outlet settings_laundry" ON outlet_settings_laundry;
DROP POLICY IF EXISTS "Admins can insert outlet settings_laundry" ON outlet_settings_laundry;
DROP POLICY IF EXISTS "Public can read outlet settings" ON outlet_settings_laundry;
DROP POLICY IF EXISTS "Admins can update outlet settings" ON outlet_settings_laundry;
DROP POLICY IF EXISTS "Admins can insert outlet settings" ON outlet_settings_laundry;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Policies for users_laundry (own data only)
CREATE POLICY "Users can read own data"
  ON users_laundry FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users_laundry FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for layanan_laundry (allow anon + authenticated)
CREATE POLICY "Anyone can view layanan_laundry"
  ON layanan_laundry FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert layanan_laundry"
  ON layanan_laundry FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update layanan_laundry"
  ON layanan_laundry FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete layanan_laundry"
  ON layanan_laundry FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for pelanggan_laundry (allow anon + authenticated)
CREATE POLICY "Anyone can view pelanggan_laundry"
  ON pelanggan_laundry FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert pelanggan_laundry"
  ON pelanggan_laundry FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update pelanggan_laundry"
  ON pelanggan_laundry FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete pelanggan_laundry"
  ON pelanggan_laundry FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for transaksi_laundry (allow anon + authenticated)
CREATE POLICY "Anyone can view transaksi_laundry"
  ON transaksi_laundry FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert transaksi_laundry"
  ON transaksi_laundry FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update transaksi_laundry"
  ON transaksi_laundry FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete transaksi_laundry"
  ON transaksi_laundry FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for pengeluaran_laundry (allow anon + authenticated)
CREATE POLICY "Anyone can view pengeluaran_laundry"
  ON pengeluaran_laundry FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert pengeluaran_laundry"
  ON pengeluaran_laundry FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update pengeluaran_laundry"
  ON pengeluaran_laundry FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete pengeluaran_laundry"
  ON pengeluaran_laundry FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for outlet_settings_laundry
CREATE POLICY "Public can read outlet settings_laundry"
  ON outlet_settings_laundry FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update outlet settings_laundry"
  ON outlet_settings_laundry FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can insert outlet settings_laundry"
  ON outlet_settings_laundry FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- 5. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_transaksi_laundry_kode_struk ON transaksi_laundry(kode_struk);
CREATE INDEX IF NOT EXISTS idx_transaksi_laundry_status ON transaksi_laundry(status_transaksi);
CREATE INDEX IF NOT EXISTS idx_transaksi_laundry_created_at ON transaksi_laundry(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pelanggan_laundry_nomor_hp ON pelanggan_laundry(nomor_hp);

-- ============================================
-- 6. VERIFY TABLES CREATED
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Setup selesai! Tabel yang dibuat:';
  RAISE NOTICE '- users_laundry';
  RAISE NOTICE '- layanan_laundry';
  RAISE NOTICE '- pelanggan_laundry';
  RAISE NOTICE '- transaksi_laundry';
  RAISE NOTICE '- pengeluaran_laundry';
  RAISE NOTICE '- outlet_settings_laundry';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies sudah dikonfigurasi.';
  RAISE NOTICE 'Indexes sudah dibuat.';
END $$;
