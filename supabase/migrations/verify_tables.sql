/*
  # Verify Tables Exist
  
  Script ini untuk memverifikasi bahwa semua tabel sudah dibuat dengan benar.
  Jalankan script ini setelah menjalankan setup_complete.sql
  
  Jika semua tabel ada, akan muncul daftar tabel.
  Jika ada error, berarti tabel belum dibuat.
*/

-- Check jika tabel users ada
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    THEN '✓ Tabel users ADA'
    ELSE '✗ Tabel users TIDAK ADA'
  END as users_status;

-- Check jika tabel layanan ada
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'layanan')
    THEN '✓ Tabel layanan ADA'
    ELSE '✗ Tabel layanan TIDAK ADA'
  END as layanan_status;

-- Check jika tabel pelanggan ada
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pelanggan')
    THEN '✓ Tabel pelanggan ADA'
    ELSE '✗ Tabel pelanggan TIDAK ADA'
  END as pelanggan_status;

-- Check jika tabel transaksi ada
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transaksi')
    THEN '✓ Tabel transaksi ADA'
    ELSE '✗ Tabel transaksi TIDAK ADA'
  END as transaksi_status;

-- List semua tabel di schema public
SELECT 
  table_name as "Nama Tabel",
  CASE 
    WHEN table_name IN ('users', 'layanan', 'pelanggan', 'transaksi')
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
  AND tablename IN ('users', 'layanan', 'pelanggan', 'transaksi')
ORDER BY tablename;

