/*
  # Seed Data untuk Laundry Management System
  
  File ini berisi data awal untuk development/testing.
  Jalankan setelah setup_complete_laundry.sql.
  
  INSTRUKSI:
  1. Buka Supabase Dashboard > SQL Editor
  2. Copy SEMUA isi file ini
  3. Paste ke SQL Editor
  4. Klik "Run"
  5. Pastikan tidak ada error
*/

-- ============================================
-- 1. USERS
-- ============================================

INSERT INTO users_laundry (id, username, name, alamat, password, salt, nomor_hp, email, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin',
  'Administrator Laundry',
  'Jl. Sudirman No. 1, Jakarta',
  'pbkdf2_sha256$100000$c8baff86ca724ed4a8d805197574dff4$1e4168bf297c271bcc63a183ace3fabb8eced1f9d721ca9f6405a0b439449a485a8d1f73423ec627126aa2d22fbf1cae5724824bd32cabe69a7dca88974cce67',
  'c8baff86ca724ed4a8d805197574dff4',
  '081234567890',
  'admin@laundryapp.com',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. LAYANAN
-- ============================================

INSERT INTO layanan_laundry (id, nama, jenis_layanan, harga, durasi_pengerjaan_jam, created_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Cuci Kiloan Reguler', 'kiloan', 8000, 48, now()),
  ('b0000000-0000-0000-0000-000000000002', 'Cuci Satuan', 'satuan', 15000, 24, now()),
  ('b0000000-0000-0000-0000-000000000003', 'Cuci Express', 'kiloan', 12000, 12, now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. PELANGGAN
-- ============================================

INSERT INTO pelanggan_laundry (id, nama, nomor_hp, alamat, poin, membership_level, created_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Budi Santoso', '081298765432', 'Jl. Thamrin No. 5, Jakarta', 120, 'Silver', now()),
  ('c0000000-0000-0000-0000-000000000002', 'Ani Wijaya', '081234567891', 'Jl. Gatot Subroto No. 10, Jakarta', 50, 'Bronze', now()),
  ('c0000000-0000-0000-0000-000000000003', 'Citra Lestari', '081356789012', 'Jl. MH Thamrin Kav. 3, Jakarta', 300, 'Gold', now()),
  ('c0000000-0000-0000-0000-000000000004', 'Dedi Kurniawan', '081467890123', 'Jl. Senayan No. 15, Jakarta', 0, 'Bronze', now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. TRANSAKSI
-- ============================================

INSERT INTO transaksi_laundry (
  id, kode_struk, id_pelanggan, id_users, id_layanan,
  nama_layanan, nama_pelanggan, nomor_hp, alamat_pelanggan,
  jumlah, harga_layanan, total, status_transaksi, status_pembayaran,
  metode_pembayaran, bukti_pembayaran_url, poin_earned, poin_used,
  latitude, longitude, jarak_km, ongkos_kirim, deadline, created_at
)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'TRX-20260705-001',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Cuci Kiloan Reguler',
    'Budi Santoso',
    '081298765432',
    'Jl. Thamrin No. 5, Jakarta',
    3, 8000, 24000,
    'selesai', 'lunas', 'tunai', NULL,
    24, 0,
    -6.175392, 106.827153, 1.20, 5000,
    now() + interval '2 days', now()
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'TRX-20260705-002',
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'Cuci Satuan',
    'Ani Wijaya',
    '081234567891',
    'Jl. Gatot Subroto No. 10, Jakarta',
    5, 15000, 75000,
    'proses', 'belum_lunas', NULL, NULL,
    75, 0,
    -6.200000, 106.816667, 3.50, 10000,
    now() + interval '1 day', now()
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'TRX-20260705-003',
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000003',
    'Cuci Express',
    'Citra Lestari',
    '081356789012',
    'Jl. MH Thamrin Kav. 3, Jakarta',
    2, 12000, 24000,
    'antrian', 'lunas', 'qris', 'https://example.com/bukti-qris-001.jpg',
    24, 10,
    -6.185000, 106.835000, 2.10, 7000,
    now() + interval '12 hours', now()
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    'TRX-20260705-004',
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Cuci Kiloan Reguler',
    'Dedi Kurniawan',
    '081467890123',
    'Jl. Senayan No. 15, Jakarta',
    4, 8000, 32000,
    'penjemputan', 'belum_lunas', NULL, NULL,
    32, 0,
    -6.225000, 106.800000, 5.00, 15000,
    now() + interval '2 days', now()
  ),
  (
    'd0000000-0000-0000-0000-000000000005',
    'TRX-20260705-005',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'Cuci Satuan',
    'Budi Santoso',
    '081298765432',
    'Jl. Thamrin No. 5, Jakarta',
    2, 15000, 30000,
    'terkirim', 'lunas', 'transfer', NULL,
    30, 0,
    -6.175392, 106.827153, 1.20, 5000,
    now() + interval '3 days', now() - interval '1 day'
  ),
  (
    'd0000000-0000-0000-0000-000000000006',
    'TRX-20260705-006',
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000003',
    'Cuci Express',
    'Ani Wijaya',
    '081234567891',
    'Jl. Gatot Subroto No. 10, Jakarta',
    1, 12000, 12000,
    'antrian', 'belum_lunas', NULL, NULL,
    12, 0,
    -6.200000, 106.816667, 3.50, 10000,
    now() + interval '6 hours', now()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. PENGELUARAN
-- ============================================

INSERT INTO pengeluaran_laundry (id, id_users, kategori, deskripsi, jumlah, tanggal, created_at)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Operasional',
    'Pembelian deterjen dan pewangi',
    250000,
    now() - interval '2 days',
    now()
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Listrik',
    'Tagihan listrik bulan Juli',
    450000,
    now() - interval '1 day',
    now()
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Gaji',
    'Gaji karyawan bulan Juli',
    1500000,
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. OUTLET SETTINGS (update default jika sudah ada)
-- ============================================

UPDATE outlet_settings_laundry
SET latitude = -6.175392,
    longitude = 106.827153,
    address = 'Monas, Jakarta Pusat',
    updated_at = now()
WHERE id = (SELECT id FROM outlet_settings_laundry ORDER BY id LIMIT 1);

-- Jika tabel kosong, insert default
INSERT INTO outlet_settings_laundry (id, latitude, longitude, address, updated_at)
SELECT gen_random_uuid(), -6.175392, 106.827153, 'Monas, Jakarta Pusat', now()
WHERE NOT EXISTS (SELECT 1 FROM outlet_settings_laundry);
