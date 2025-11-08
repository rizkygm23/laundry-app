/*
  # Create Laundry Management System Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User ID
      - `username` (text) - Username for login
      - `name` (text) - Full name
      - `alamat` (text) - Address
      - `password` (text) - Hashed password
      - `nomor_hp` (text) - Phone number
      - `email` (text, unique) - Email address
      - `created_at` (timestamptz) - Creation timestamp

    - `layanan` (Services)
      - `id` (uuid, primary key) - Service ID
      - `nama` (text) - Service name
      - `jenis_layanan` (text) - Service type (kiloan/satuan)
      - `harga` (integer) - Price
      - `durasi_pengerjaan_jam` (integer) - Processing duration in hours
      - `created_at` (timestamptz) - Creation timestamp

    - `pelanggan` (Customers)
      - `id` (uuid, primary key) - Customer ID
      - `nama` (text) - Customer name
      - `nomor_hp` (text) - Phone number
      - `alamat` (text) - Address (optional)
      - `created_at` (timestamptz) - Creation timestamp

    - `transaksi` (Transactions)
      - `id` (uuid, primary key) - Transaction ID
      - `kode_struk` (text, unique) - Receipt code
      - `id_pelanggan` (uuid) - Customer ID reference
      - `id_users` (uuid) - User ID reference
      - `id_layanan` (uuid) - Service ID reference
      - `nama_layanan` (text) - Service name snapshot
      - `nama_pelanggan` (text) - Customer name snapshot
      - `alamat_pelanggan` (text) - Customer address snapshot
      - `jumlah` (integer) - Quantity
      - `harga_layanan` (integer) - Service price snapshot
      - `total` (integer) - Total price
      - `status_transaksi` (text) - Transaction status (antrian/proses/selesai)
      - `status_pembayaran` (text) - Payment status (belum_lunas/lunas)
      - `deadline` (timestamptz) - Deadline timestamp
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Public read access for status checking
*/

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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE layanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for layanan table (all authenticated users can manage)
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

-- RLS Policies for pelanggan table
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

-- RLS Policies for transaksi table
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

-- Public policy for checking transaction status (no auth required)
CREATE POLICY "Anyone can view transaksi for status checking"
  ON transaksi FOR SELECT
  TO anon
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transaksi_kode_struk ON transaksi(kode_struk);
CREATE INDEX IF NOT EXISTS idx_transaksi_status ON transaksi(status_transaksi);
CREATE INDEX IF NOT EXISTS idx_transaksi_created_at ON transaksi(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pelanggan_nomor_hp ON pelanggan(nomor_hp);
