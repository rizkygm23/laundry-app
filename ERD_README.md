# ERD (Entity Relationship Diagram) - Laundry Management System

File ERD untuk aplikasi Laundry Management System menggunakan format dbdiagram.io.

## Cara Menggunakan

1. Buka website [dbdiagram.io](https://dbdiagram.io)
2. Klik **"Create New Diagram"** atau **"Import"**
3. Copy isi dari file `erd_laundry_system.dbml` atau `erd_dbdiagram.txt`
4. Paste ke editor di dbdiagram.io
5. Diagram akan otomatis ter-render

## File yang Tersedia

- **`erd_laundry_system.dbml`** - Versi lengkap dengan komentar detail (recommended)
- **`erd_dbdiagram.txt`** - Versi sederhana

## Struktur Database

Database terdiri dari 5 tabel utama:

1. **users** - Data pengguna/admin sistem
2. **layanan** - Daftar layanan laundry (kiloan/satuan)
3. **pelanggan** - Data pelanggan
4. **transaksi** - Data transaksi laundry
5. **pengeluaran** - Catatan pengeluaran usaha

## Relationships

- `transaksi.id_pelanggan` → `pelanggan.id` (one-to-many)
- `transaksi.id_users` → `users.id` (one-to-many)
- `transaksi.id_layanan` → `layanan.id` (one-to-many)
- `pengeluaran.id_users` → `users.id` (one-to-many, optional)

Semua relationships menggunakan `ON DELETE SET NULL` untuk menjaga data historis.

## Export Diagram

Setelah diagram ter-render di dbdiagram.io, Anda dapat:
- Export sebagai PNG/SVG
- Export sebagai PDF
- Share link diagram
- Export SQL script

