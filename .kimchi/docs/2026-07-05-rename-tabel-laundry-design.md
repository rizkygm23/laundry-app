# Design Spec: Rename Semua Tabel Database ke Suffix `_laundry`

## 1. Overview / Tujuan

Project **laundry-app** menggunakan Supabase (PostgreSQL) sebagai backend. Saat ini semua tabel berada di schema `public` dengan nama umum yang rawan bentrok (`users`, `layanan`, `pelanggan`, `transaksi`, `pengeluaran`, `outlet_settings`).

Tujuan spesifik:
1. Memberi suffix `_laundry` pada **semua tabel** agar nama lebih eksplisit dan tidak bentrok dengan tabel sistem/fitur lain.
2. Menyediakan file SQL schema lengkap yang siap dijalankan.
3. Menyediakan file SQL seed data yang realistis untuk development/testing.
4. Memastikan aplikasi Next.js tetap berjalan dengan memperbarui referensi tabel di kode.

## 2. Current State

Tabel yang ada saat ini:

| Tabel | Fungsi |
|---|---|
| `users` | Data admin/pengguna aplikasi |
| `layanan` | Daftar layanan laundry (kiloan/satuan) |
| `pelanggan` | Data pelanggan |
| `transaksi` | Transaksi/order laundry |
| `pengeluaran` | Catatan pengeluaran usaha |
| `outlet_settings` | Pengaturan lokasi outlet (lat/long/address) |

Relasi antar tabel dijelaskan di `erd_laundry_system.dbml`.

File SQL yang ada:
- `schema_dump.sql` — dump saat ini (kecil, hanya catatan instal Supabase CLI).
- `supabase/migrations/create_laundry_schema.sql` — schema awal 4 tabel + RLS.
- `supabase/migrations/setup_complete.sql` — schema + policies lengkap.
- `supabase/migrations/verify_tables.sql` — script verifikasi keberadaan tabel.
- `supabase/migrations/2024*.sql` — migration incremental.

## 3. Target State

### 3.1 Mapping Nama Tabel

| Tabel Lama | Tabel Baru |
|---|---|
| `users` | `users_laundry` |
| `layanan` | `layanan_laundry` |
| `pelanggan` | `pelanggan_laundry` |
| `transaksi` | `transaksi_laundry` |
| `pengeluaran` | `pengeluaran_laundry` |
| `outlet_settings` | `outlet_settings_laundry` |

### 3.2 Keputusan Penting

- **Nama kolom TIDAK diubah**, termasuk kolom foreign key (`id_pelanggan`, `id_layanan`, `id_users`, dll.). Alasannya:
  - Menghindari perubahan besar di TypeScript interfaces, form, dan logika bisnis.
  - Referensi `auth.users` (Supabase Auth) tidak terpengaruh.
  - Foreign key constraint tetap merujuk ke tabel baru.
- **Schema tetap `public`**, hanya nama tabel yang berubah.
- **RLS policies** disalin dari setup existing dan menyesuaikan nama tabel.
- **Indexes** disalin dan menyesuaikan nama tabel.
- **CHECK constraints** disalin dari migration incremental terbaru.

## 4. Files yang Akan Dibuat / Dimodifikasi

### 4.1 File Baru

| File | Deskripsi |
|---|---|
| `supabase/migrations/setup_complete_laundry.sql` | Schema lengkap dengan nama tabel `_laundry` |
| `supabase/migrations/seed_laundry.sql` | Seed data: 1 admin, 3 layanan, 4 pelanggan, 6 transaksi, 3 pengeluaran, 1 outlet setting |
| `supabase/migrations/verify_tables_laundry.sql` | Verifikasi keberadaan tabel `_laundry` |
| `.kimchi/docs/2026-07-05-rename-tabel-laundry-design.md` | Spec ini |

### 4.2 File yang Diubah

Akan diidentifikasi saat implementation. Perkiraan awal:
- `lib/supabase.ts` — tidak perlu diubah (schema public tetap).
- `lib/test-supabase.ts` — update `.from(...)` ke nama tabel baru.
- `contexts/AuthContext.tsx` — update `.from('users')` → `.from('users_laundry')`.
- `app/page.tsx` — update `.from('layanan')`.
- `app/layanan/page.tsx` — tidak ada query langsung, import komponen.
- `app/transaksi/[id]/page.tsx` — update `.from('transaksi')`.
- `app/dashboard/settings/page.tsx` — update `.from('outlet_settings')`.
- Komponen/komponen lain yang melakukan query Supabase (`components/layanan/`, `components/transaksi/`, dll.).
- `erd_laundry_system.dbml` — update nama tabel.

> Catatan: Setelah perubahan SQL dan kode, migration lama (`create_laundry_schema.sql`, `setup_complete.sql`, dsb.) **tetap tidak diubah** agar tetap merekam history. Kita hanya menambahkan file schema baru yang merupakan versi canonical terbaru.

## 5. SQL Schema Detail

Schema harus mencakup semua perubahan incremental yang sudah ada:

1. **Tabel `users_laundry`**
   - Kolom: `id uuid pk`, `username text unique`, `name text`, `alamat text`, `password text`, `nomor_hp text`, `email text unique`, `created_at timestamptz`.

2. **Tabel `layanan_laundry`**
   - Kolom: `id uuid pk`, `nama text`, `jenis_layanan text CHECK ('kiloan','satuan')`, `harga int`, `durasi_pengerjaan_jam int`, `created_at timestamptz`.

3. **Tabel `pelanggan_laundry`**
   - Kolom: `id uuid pk`, `nama text`, `nomor_hp text`, `alamat text`, `poin int default 0`, `membership_level text default 'Bronze'`, `created_at timestamptz`.

4. **Tabel `transaksi_laundry`**
   - Kolom standar + `metode_pembayaran`, `bukti_pembayaran_url`, `poin_earned`, `poin_used`, `latitude`, `longitude`, `jarak_km`, `ongkos_kirim`.
   - CHECK: `status_transaksi` ∈ `('antrian','proses','selesai','penjemputan','terkirim')`, `status_pembayaran` ∈ `('belum_lunas','lunas')`, `metode_pembayaran` ∈ `('tunai','transfer','e_wallet','qris')`.
   - Foreign key ke `pelanggan_laundry`, `users_laundry`, `layanan_laundry` dengan `ON DELETE SET NULL`.
   - `kode_struk` NOT NULL, tidak lagi UNIQUE karena migration memperbolehkan duplikat.

5. **Tabel `pengeluaran_laundry`**
   - Kolom: `id uuid pk`, `id_users uuid REFERENCES users_laundry(id) ON DELETE SET NULL`, `kategori text`, `deskripsi text`, `jumlah int`, `tanggal timestamptz`, `created_at timestamptz`.

6. **Tabel `outlet_settings_laundry`**
   - Kolom: `id uuid pk`, `latitude double precision`, `longitude double precision`, `address text`, `updated_at timestamptz`.
   - Insert default 1 row (Monas, Jakarta) jika tabel kosong.

7. **RLS Policies**
   - Enable RLS di semua tabel.
   - `anon, authenticated` bisa CRUD `layanan_laundry`, `pelanggan_laundry`, `transaksi_laundry`, `pengeluaran_laundry`, `outlet_settings_laundry`.
   - `users_laundry`: authenticated hanya bisa read/update own row.
   - `transaksi_laundry`: public read (anon) tetap diizinkan.

8. **Indexes**
   - `idx_transaksi_laundry_kode_struk`
   - `idx_transaksi_laundry_status`
   - `idx_transaksi_laundry_created_at`
   - `idx_pelanggan_laundry_nomor_hp`

## 6. SQL Seed Detail

Seed akan mencakup data realistis:

- **users_laundry**: 1 admin default.
- **layanan_laundry**: 3 layanan (Cuci Kiloan, Cuci Satuan, Express).
- **pelanggan_laundry**: 4 pelanggan dengan poin & membership level.
- **transaksi_laundry**: 6 transaksi dengan variasi status, pembayaran, metode, delivery, poin.
- **pengeluaran_laundry**: 3 pengeluaran operasional.
- **outlet_settings_laundry**: 1 row default.

> Seed akan menggunakan UUID statis untuk memudahkan testing.

## 7. Code Changes Detail

Setiap string tabel di kode TypeScript/JavaScript akan diubah dari `from('X')` menjadi `from('X_laundry')`. Contoh:

```ts
// Before
const { data } = await supabase.from('transaksi').select('*');

// After
const { data } = await supabase.from('transaksi_laundry').select('*');
```

Untuk menghindari typo, perubahan dilakukan dengan pencarian global pada nama tabel yang tepat (word boundary).

## 8. Verification

Setelah implementasi:

1. Jalankan `npm run typecheck` untuk memastikan tidak ada TypeScript error.
2. Jalankan `npm run lint` untuk memastikan tidak ada lint error.
3. Verifikasi file SQL dapat diparse dengan `psql`/`supabase` CLI (jika tersedia).
4. Cek tidak ada string tabel lama yang tersisa dengan grep.

## 9. Out of Scope

- Perubahan struktur kolom/data type.
- Perubahan business logic.
- Perubahan UI/UX.
- Migrasi data dari database production existing (fokus ke schema & seed baru).

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Typo saat rename tabel di kode | Gunakan pencarian global + typecheck |
| Policy lama tidak tercover | Salin semua policies existing ke file baru |
| Constraint terbaru tertinggal | Pastikan semua migration incremental tercakup |

---

**Status:** Menunggu approval user sebelum membuat implementation plan.
