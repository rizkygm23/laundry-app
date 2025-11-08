# Setup Aplikasi Laundry Management

## 1. Setup Database Supabase

Jalankan SQL berikut di Supabase SQL Editor:

File: `supabase/migrations/create_laundry_schema.sql`

Atau copy-paste SQL tersebut ke Supabase Dashboard > SQL Editor dan jalankan.

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
