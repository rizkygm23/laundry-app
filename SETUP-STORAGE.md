# Setup Supabase Storage untuk Bukti Pembayaran

File ini menjelaskan cara setup Supabase Storage untuk menyimpan bukti pembayaran.

## Langkah-langkah Setup

### 1. Buat Storage Bucket

1. Buka **Supabase Dashboard** > **Storage**
2. Klik **"New bucket"**
3. Isi informasi bucket:
   - **Name**: `payment-proofs`
   - **Public bucket**: ✅ **Centang** (agar bisa diakses via URL publik)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`
     - `application/pdf`
4. Klik **"Create bucket"**

### 2. Setup Storage Policies

Setelah bucket dibuat, kita perlu setup policies agar aplikasi bisa upload file.

1. Buka **Supabase Dashboard** > **Storage** > **Policies** > **payment-proofs**
2. Klik **"New Policy"** untuk membuat policy baru

#### Policy 1: Allow Authenticated Users to Upload

- **Policy name**: `Allow authenticated users to upload payment proofs`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  (bucket_id = 'payment-proofs'::text) AND (auth.role() = 'authenticated'::text)
  ```

#### Policy 2: Allow Authenticated Users to Read

- **Policy name**: `Allow authenticated users to read payment proofs`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  (bucket_id = 'payment-proofs'::text) AND (auth.role() = 'authenticated'::text)
  ```

#### Policy 3: Allow Public Read (Optional)

Jika ingin bukti pembayaran bisa diakses tanpa login:

- **Policy name**: `Allow public read access`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  bucket_id = 'payment-proofs'::text
  ```

### 3. Jalankan Migration Database

Jalankan migration untuk menambahkan kolom pembayaran:

1. Buka **Supabase Dashboard** > **SQL Editor**
2. Copy isi file `supabase/migrations/20241110_add_payment_fields.sql`
3. Paste ke SQL Editor
4. Klik **"Run"**

Migration ini akan menambahkan:
- `metode_pembayaran` (text): Metode pembayaran (tunai, transfer, e_wallet, qris)
- `bukti_pembayaran_url` (text): URL bukti pembayaran di storage

### 4. Verifikasi Setup

Setelah setup selesai, coba:

1. Buat transaksi baru dengan opsi "Bayar langsung"
2. Pilih metode pembayaran non-tunai
3. Upload bukti pembayaran
4. Cek apakah file berhasil diupload di **Storage** > **payment-proofs**

## Troubleshooting

### Error: "new row violates row-level security policy"

**Solusi**: Pastikan storage policies sudah dibuat dengan benar dan user sudah authenticated.

### Error: "The resource already exists"

**Solusi**: Bucket `payment-proofs` sudah ada. Gunakan bucket yang sudah ada atau hapus bucket lama terlebih dahulu.

### File tidak bisa diakses via URL

**Solusi**: 
1. Pastikan bucket dibuat sebagai **Public bucket**
2. Pastikan policy untuk SELECT sudah dibuat
3. Cek URL yang dihasilkan di kolom `bukti_pembayaran_url` di tabel `transaksi`

## Catatan

- File yang diupload akan disimpan dengan format: `payment-proofs/{transaksiId}-{timestamp}.{ext}`
- Maksimal ukuran file: 5MB
- Format file yang didukung: JPG, PNG, WEBP, PDF

