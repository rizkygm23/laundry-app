# 🚀 Setup Database - Quick Guide

## ⚠️ Error yang Sering Muncul

Jika Anda melihat error seperti ini:
```
Could not find the table 'public.layanan' in the schema cache
```

**Ini berarti tabel belum dibuat di database Supabase!**

## ✅ Solusi: Setup Database

### Cara Termudah (5 Menit)

1. **Buka Supabase Dashboard**
   - Login ke https://supabase.com/dashboard
   - Pilih project Anda

2. **Buka SQL Editor**
   - Klik menu **"SQL Editor"** di sidebar kiri
   - Klik tombol **"New query"**

3. **Copy-Paste SQL Setup**
   - Buka file `supabase/migrations/setup_complete.sql` di project Anda
   - Copy **SEMUA** isi file (Ctrl+A, Ctrl+C)
   - Paste ke SQL Editor di Supabase (Ctrl+V)

4. **Jalankan SQL**
   - Klik tombol **"Run"** (atau tekan Ctrl+Enter)
   - Tunggu sampai muncul pesan **"Success. No rows returned"**
   - Jika ada error, baca pesan error dan perbaiki

5. **Verifikasi (Optional)**
   - Buka file `supabase/migrations/verify_tables.sql`
   - Copy semua isi dan jalankan di SQL Editor
   - Pastikan semua tabel menunjukkan **"✓ ADA"**

6. **Cek di Table Editor**
   - Klik menu **"Table Editor"** di sidebar
   - Pastikan ada 4 tabel: `users`, `layanan`, `pelanggan`, `transaksi`

## 🎉 Selesai!

Setelah setup selesai, aplikasi Anda sudah bisa menyimpan data ke database.

## 🔍 Troubleshooting

### Tabel masih tidak muncul?

1. **Refresh browser** atau reload halaman aplikasi
2. **Cek di Supabase Dashboard > Table Editor** apakah tabel sudah ada
3. **Cek error di SQL Editor** - mungkin ada syntax error
4. **Pastikan Anda menjalankan SQL di project yang benar**

### Data masih tidak tersimpan?

**⚠️ PENTING: Jika tabel sudah dibuat tapi masih error, kemungkinan masalahnya di environment variables!**

1. **Buat file `.env.local`** di root project (sama level dengan `package.json`)
   
   File harus berisi:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Cara mendapatkan URL dan Key:**
   - Buka **Supabase Dashboard** → **Settings** → **API**
   - Copy **Project URL** → paste ke `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon/public key** → paste ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Restart development server** (WAJIB setelah membuat/update `.env.local`):
   ```bash
   # Stop server (Ctrl+C)
   # Start lagi
   npm run dev
   ```

4. **Clear browser cache** atau buka **Incognito/Private window**

5. **Buka browser console** (F12) untuk melihat error detail

### Masih Error?

1. Pastikan Anda sudah menjalankan `setup_complete.sql` dengan benar
2. Pastikan tidak ada error saat menjalankan SQL
3. Coba jalankan `verify_tables.sql` untuk cek status tabel
4. Jika masih error, cek di Supabase Dashboard > Logs untuk melihat error detail

## 📞 Butuh Bantuan?

Jika masih mengalami masalah:
1. Cek error message di browser console (F12)
2. Cek error di Supabase Dashboard > Logs
3. Pastikan semua langkah di atas sudah dilakukan dengan benar

