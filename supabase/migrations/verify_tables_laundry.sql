/*
  # Verify Tables `_laundry` Exist
  
  Script ini untuk memverifikasi bahwa semua tabel dengan suffix `_laundry`
  sudah dibuat dengan benar.
  
  Jalankan script ini setelah menjalankan setup_complete_laundry.sql.
  
  Jika semua tabel ada, akan muncul daftar tabel.
  Jika ada error, berarti tabel belum dibuat.
*/

-- Check jika tabel users_laundry ada
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users_laundry')
    THEN '✓ Tabel users_laundry ADA'
    ELSE '✗ Tabel users_laundry TIDAK ADA'
  END as users_laundry_status;

-- Check jika tabel layanan_laundry ada
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'layanan_laundry')
    THEN '✓ Tabel layanan_laundry ADA'
    ELSE '✗ Tabel layanan_laundry TIDAK ADA'
  END as layanan_laundry_status;

-- Check jika tabel pelanggan_laundry ada
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pelanggan_laundry')
    THEN '✓ Tabel pelanggan_laundry ADA'
    ELSE '✗ Tabel pelanggan_laundry TIDAK ADA'
  END as pelanggan_laundry_status;

-- Check jika tabel transaksi_laundry ada
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transaksi_laundry')
    THEN '✓ Tabel transaksi_laundry ADA'
    ELSE '✗ Tabel transaksi_laundry TIDAK ADA'
  END as transaksi_laundry_status;

-- Check jika tabel pengeluaran_laundry ada
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pengeluaran_laundry')
    THEN '✓ Tabel pengeluaran_laundry ADA'
    ELSE '✗ Tabel pengeluaran_laundry TIDAK ADA'
  END as pengeluaran_laundry_status;

-- Check jika tabel outlet_settings_laundry ada
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'outlet_settings_laundry')
    THEN '✓ Tabel outlet_settings_laundry ADA'
    ELSE '✗ Tabel outlet_settings_laundry TIDAK ADA'
  END as outlet_settings_laundry_status;

-- List semua tabel di schema public
SELECT 
  table_name as "Nama Tabel",
  CASE 
    WHEN table_name IN ('users_laundry', 'layanan_laundry', 'pelanggan_laundry', 'transaksi_laundry', 'pengeluaran_laundry', 'outlet_settings_laundry')
    THEN '✓'
    ELSE ''
  END as "Status"
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check RLS status
SELECT 
  tablename as "Tabel",
  CASE 
    WHEN rowsecurity THEN '✓ RLS Enabled'
    ELSE '✗ RLS Disabled'
  END as "RLS Status"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users_laundry', 'layanan_laundry', 'pelanggan_laundry', 'transaksi_laundry', 'pengeluaran_laundry', 'outlet_settings_laundry')
ORDER BY tablename;
