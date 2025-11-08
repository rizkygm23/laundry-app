# Setup Aplikasi Laundry Management

## 1. Setup Database Supabase

### ⚠️ PENTING: Setup Database Wajib Dilakukan!

**Jika Anda mendapatkan error "Could not find the table 'public.layanan' in the schema cache"**, berarti tabel belum dibuat di database Supabase. Ikuti langkah-langkah berikut:

### 🚀 Cara Setup Database (CARA TERMUDAH)

**Opsi 1: Setup Lengkap Sekali Jalankan (RECOMMENDED)**

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Buka file `supabase/migrations/setup_complete.sql` di project Anda
3. **Copy SEMUA isi file** tersebut (Ctrl+A, Ctrl+C)
4. **Paste ke SQL Editor** di Supabase (Ctrl+V)
5. Klik tombol **"Run"** atau tekan **Ctrl+Enter**
6. Pastikan muncul pesan **"Success. No rows returned"** (tidak ada error)
7. Selesai! Tabel sudah dibuat dan siap digunakan

### ✅ Verifikasi Setup (Optional tapi Recommended)

Setelah menjalankan setup, verifikasi dengan:

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Buka file `supabase/migrations/verify_tables.sql`
3. **Copy semua isi file** dan paste ke SQL Editor
4. Klik **"Run"**
5. Pastikan semua tabel menunjukkan **"✓ ADA"**

### 📋 Opsi 2: Setup Manual (2 Langkah)

Jika ingin menjalankan step by step:

**Langkah 1: Buat Tabel**
1. Buka file `supabase/migrations/create_laundry_schema.sql`
2. Copy semua isi dan jalankan di Supabase SQL Editor

**Langkah 2: Fix RLS Policies**
1. Buka file `supabase/migrations/fix_anon_policies.sql`
2. Copy semua isi dan jalankan di Supabase SQL Editor

### 🔧 Troubleshooting

**Error: "Could not find the table 'public.layanan'"**
- ✅ Pastikan sudah menjalankan `setup_complete.sql`
- ✅ Pastikan tidak ada error saat menjalankan SQL
- ✅ Cek di Supabase Dashboard > Table Editor, pastikan tabel `layanan`, `pelanggan`, dan `transaksi` ada

**Error: "new row violates row-level security policy"**
- ✅ Pastikan sudah menjalankan `fix_anon_policies.sql` atau `setup_complete.sql`
- ✅ Pastikan RLS policies sudah dibuat dengan benar

**Data tidak tersimpan**
- ✅ Cek browser console (F12) untuk melihat error detail
- ✅ Pastikan environment variables `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah di-set
- ✅ Pastikan RLS policies sudah diupdate untuk anon users

### 📝 Catatan Penting

- Aplikasi ini **TIDAK menggunakan autentikasi Supabase**, jadi perlu mengizinkan anon users untuk melakukan operasi CRUD
- File `setup_complete.sql` sudah include semua yang diperlukan (tabel + policies + indexes)
- File ini aman untuk dijalankan berulang kali (menggunakan `IF NOT EXISTS` dan `DROP POLICY IF EXISTS`)

## 2. Fitur Aplikasi

### Halaman Utama (/)
- Dashboard dengan statistik transaksi
- Tab untuk mengelola Transaksi, Layanan, dan Pelanggan
- CRUD lengkap untuk semua entitas

### Buat Transaksi (/transaksi/create)
- Pilih layanan (kiloan/satuan)
- Input data pelanggan (nama, nomor WA, alamat)
- Auto-generate kode struk
- Auto-calculate total harga dan deadline

### Struk Transaksi (/struk/[kode])
- Tampilan struk lengkap dengan detail transaksi
- QR Code untuk cek status
- Tombol cetak struk
- Tombol kirim ke WhatsApp pelanggan

### Cek Status (/status/[kode])
- Halaman public untuk cek status pesanan
- Real-time update menggunakan Supabase Realtime
- Tidak perlu login

### QR Code (/qr/[kode])
- Tampilan QR Code besar untuk scan
- Download QR Code sebagai gambar

### Detail Transaksi (/transaksi/[id])
- Informasi lengkap transaksi
- Akses ke struk dan QR Code

## 3. Alur Penggunaan

1. **Tambah Layanan**: Buat daftar layanan laundry (contoh: Cuci Kering Setrika - Kiloan - Rp 5000/kg)

2. **Buat Transaksi**:
   - Klik "Transaksi Baru"
   - Pilih layanan
   - Input jumlah (kg atau pcs)
   - Input data pelanggan
   - Sistem generate kode struk otomatis
   - Sistem hitung total dan deadline otomatis

3. **Cetak/Kirim Struk**:
   - Cetak struk untuk diberikan ke pelanggan
   - Atau kirim via WhatsApp
   - Struk berisi QR Code untuk cek status

4. **Kelola Status**:
   - Update status transaksi: Antrian → Proses → Selesai
   - Update status pembayaran: Belum Lunas → Lunas
   - Semua update tercermin real-time di halaman status

5. **Pelanggan Cek Status**:
   - Scan QR Code atau buka link status
   - Lihat status pesanan real-time
   - Tidak perlu login

## 4. Database Schema

### Table: users
- Untuk admin/staff laundry (belum diimplementasi auth)

### Table: layanan
- Daftar jenis layanan
- Jenis: kiloan atau satuan
- Harga dan durasi pengerjaan

### Table: pelanggan
- Data pelanggan
- Auto-create atau update saat buat transaksi

### Table: transaksi
- Transaksi laundry
- Status transaksi: antrian, proses, selesai
- Status pembayaran: belum_lunas, lunas
- Menyimpan snapshot data untuk history

## 5. Fitur Tambahan yang Bisa Dikembangkan

1. Authentication untuk staff
2. Notifikasi WhatsApp otomatis saat status berubah
3. Laporan keuangan dan statistik
4. Export data transaksi
5. Multi-branch support
6. Diskon dan promo
7. Loyalty points
8. Scan QR untuk update status (pakai kamera)
