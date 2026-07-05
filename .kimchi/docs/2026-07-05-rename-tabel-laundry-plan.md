# Rename Tabel Database ke Suffix `_laundry` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyediakan schema SQL & seed data untuk tabel-tabel laundry dengan suffix `_laundry`, sekaligus memperbarui seluruh referensi tabel di kode Next.js agar aplikasi tetap berjalan.

**Architecture:** Schema PostgreSQL baru (`setup_complete_laundry.sql`) berisi DDL untuk semua tabel `_laundry`, RLS policies, indexes, dan constraints. File terpisah (`seed_laundry.sql`) berisi data awal. Kode aplikasi di-update dengan global replace pada string tabel di `.from('...')` dan query SQL raw.

**Tech Stack:** Next.js 13.5, TypeScript, Supabase (PostgreSQL), Tailwind.

---

## File Structure Overview

| File | Aksi | Tanggung Jawab |
|---|---|---|
| `supabase/migrations/setup_complete_laundry.sql` | Create | Schema lengkap `_laundry` |
| `supabase/migrations/seed_laundry.sql` | Create | Data awal |
| `supabase/migrations/verify_tables_laundry.sql` | Create | Verifikasi tabel `_laundry` |
| `erd_laundry_system.dbml` | Modify | Update nama tabel |
| `lib/test-supabase.ts` | Modify | Update `.from(...)` |
| `contexts/AuthContext.tsx` | Modify | Update `.from('users')` |
| `app/page.tsx` | Modify | Update `.from('layanan')` |
| `app/booking/page.tsx` | Modify | Update `.from(...)` |
| `app/dashboard/settings/page.tsx` | Modify | Update `.from('outlet_settings')` |
| `app/delivery/page.tsx` | Modify | Update `.from(...)` |
| `app/kas/page.tsx` | Modify | Update `.from(...)` |
| `app/struk/[kode]/page.tsx` | Modify | Update `.from(...)` |
| `app/status/[kode]/page.tsx` | Modify | Update `.from('transaksi')` |
| `app/transaksi/[id]/page.tsx` | Modify | Update `.from('transaksi')` |
| `app/transaksi/create/page.tsx` | Modify | Update `.from(...)` |
| `app/transaksi/page.tsx` | Modify | Update `.from('transaksi')` |
| `components/booking/BookingForm.tsx` | Modify | Update `.from(...)` |
| `components/layanan/layanan-list.tsx` | Modify | Update `.from('layanan')` |
| `components/pelanggan/pelanggan-list.tsx` | Modify | Update `.from('pelanggan')` |
| `components/transaksi/transaksi-list.tsx` | Modify | Update `.from(...)` |
| `components/transaksi/PaymentModal.tsx` | Modify | Update `.from('transaksi')` |

> Note: Bucket storage `payment-proofs` di `PaymentModal.tsx` **tidak** diubah karena itu bukan nama tabel.

---

## Task 1: Buat SQL Schema Lengkap

**Files:**
- Create: `supabase/migrations/setup_complete_laundry.sql`

- [ ] **Step 1: Write schema file**

  Isi file harus mencakup:
  - `users_laundry`
  - `layanan_laundry`
  - `pelanggan_laundry` (dengan `poin`, `membership_level`)
  - `transaksi_laundry` (dengan semua kolom incremental: payment, map, delivery fee, poin)
  - `pengeluaran_laundry`
  - `outlet_settings_laundry` (dengan insert default)
  - RLS policies untuk semua tabel
  - Indexes

- [ ] **Step 2: Verifikasi sintaks SQL**

  Run:
  ```bash
  psql -f supabase/migrations/setup_complete_laundry.sql --dry-run 2>&1 | tail -20
  ```
  atau periksa manual tidak ada syntax error.

---

## Task 2: Buat SQL Seed Data

**Files:**
- Create: `supabase/migrations/seed_laundry.sql`

- [ ] **Step 1: Write seed file**

  Isi minimal:
  - 1 user admin
  - 3 layanan
  - 4 pelanggan
  - 6 transaksi
  - 3 pengeluaran
  - 1 outlet_settings

  Gunakan UUID statis agar konsisten.

- [ ] **Step 2: Verifikasi urutan insert**

  Pastikan urutan: `users_laundry` → `layanan_laundry` → `pelanggan_laundry` → `transaksi_laundry` → `pengeluaran_laundry` → `outlet_settings_laundry`.

---

## Task 3: Buat SQL Verifikasi Tabel

**Files:**
- Create: `supabase/migrations/verify_tables_laundry.sql`

- [ ] **Step 1: Write verify file**

  Isi harus mengecek keberadaan tabel:
  - `users_laundry`
  - `layanan_laundry`
  - `pelanggan_laundry`
  - `transaksi_laundry`
  - `pengeluaran_laundry`
  - `outlet_settings_laundry`

---

## Task 4: Update ERD DBML

**Files:**
- Modify: `erd_laundry_system.dbml`

- [ ] **Step 1: Replace semua nama tabel di DBML**

  ```bash
  sed -i "s/Table users/Table users_laundry/g" erd_laundry_system.dbml
  sed -i "s/Table layanan/Table layanan_laundry/g" erd_laundry_system.dbml
  sed -i "s/Table pelanggan/Table pelanggan_laundry/g" erd_laundry_system.dbml
  sed -i "s/Table transaksi/Table transaksi_laundry/g" erd_laundry_system.dbml
  sed -i "s/Table pengeluaran/Table pengeluaran_laundry/g" erd_laundry_system.dbml
  sed -i "s/Table outlet_settings/Table outlet_settings_laundry/g" erd_laundry_system.dbml
  ```

- [ ] **Step 2: Update relasi `Ref` di DBML**

  Pastikan referensi `transaksi_laundry.id_pelanggan > pelanggan_laundry.id`, dst.

---

## Task 5: Update Referensi Tabel di Kode Aplikasi

**Files:**
- Modify: semua file `.ts`/`.tsx` yang mengandung `.from('...')` untuk tabel.

- [ ] **Step 1: Replace `users` → `users_laundry` (hanya di context query)**

  File target: `contexts/AuthContext.tsx`.

  ```bash
  sed -i "s/\.from('users')/.from('users_laundry')/g" contexts/AuthContext.tsx
  ```

- [ ] **Step 2: Replace `layanan` → `layanan_laundry` di query Supabase**

  File target: `app/page.tsx`, `app/booking/page.tsx`, `app/transaksi/create/page.tsx`, `components/layanan/layanan-list.tsx`, `lib/test-supabase.ts`.

  ```bash
  sed -i "s/\.from('layanan')/.from('layanan_laundry')/g" \
    app/page.tsx app/booking/page.tsx app/transaksi/create/page.tsx \
    components/layanan/layanan-list.tsx lib/test-supabase.ts
  ```

- [ ] **Step 3: Replace `pelanggan` → `pelanggan_laundry` di query Supabase**

  File target: `components/pelanggan/pelanggan-list.tsx`, `components/booking/BookingForm.tsx`, `components/transaksi/transaksi-list.tsx`, `app/booking/page.tsx`, `app/delivery/page.tsx`, `app/struk/[kode]/page.tsx`, `app/transaksi/create/page.tsx`.

  ```bash
  sed -i "s/\.from('pelanggan')/.from('pelanggan_laundry')/g" \
    components/pelanggan/pelanggan-list.tsx \
    components/booking/BookingForm.tsx \
    components/transaksi/transaksi-list.tsx \
    app/booking/page.tsx app/delivery/page.tsx \
    app/struk/[kode]/page.tsx app/transaksi/create/page.tsx
  ```

- [ ] **Step 4: Replace `transaksi` → `transaksi_laundry` di query Supabase**

  File target: `app/transaksi/[id]/page.tsx`, `app/transaksi/page.tsx`, `app/transaksi/create/page.tsx`, `app/struk/[kode]/page.tsx`, `app/status/[kode]/page.tsx`, `app/delivery/page.tsx`, `app/kas/page.tsx`, `components/transaksi/transaksi-list.tsx`, `components/transaksi/PaymentModal.tsx`, `lib/test-supabase.ts`.

  ```bash
  sed -i "s/\.from('transaksi')/.from('transaksi_laundry')/g" \
    app/transaksi/[id]/page.tsx app/transaksi/page.tsx \
    app/transaksi/create/page.tsx app/struk/[kode]/page.tsx \
    app/status/[kode]/page.tsx app/delivery/page.tsx app/kas/page.tsx \
    components/transaksi/transaksi-list.tsx \
    components/transaksi/PaymentModal.tsx lib/test-supabase.ts
  ```

- [ ] **Step 5: Replace `pengeluaran` → `pengeluaran_laundry` di query Supabase**

  File target: `app/kas/page.tsx`.

  ```bash
  sed -i "s/\.from('pengeluaran')/.from('pengeluaran_laundry')/g" app/kas/page.tsx
  ```

- [ ] **Step 6: Replace `outlet_settings` → `outlet_settings_laundry` di query Supabase**

  File target: `components/booking/BookingForm.tsx`, `app/dashboard/settings/page.tsx`, `app/struk/[kode]/page.tsx`.

  ```bash
  sed -i "s/\.from('outlet_settings')/.from('outlet_settings_laundry')/g" \
    components/booking/BookingForm.tsx \
    app/dashboard/settings/page.tsx app/struk/[kode]/page.tsx
  ```

- [ ] **Step 7: Cek sisa referensi tabel lama**

  Run:
  ```bash
  grep -R "\.from('users'\|\.from('layanan'\|\.from('pelanggan'\|\.from('transaksi'\|\.from('pengeluaran'\|\.from('outlet_settings'" \
    app/ components/ contexts/ lib/ --include='*.ts' --include='*.tsx'
  ```
  Expected: no output.

---

## Task 6: Verifikasi Akhir

**Files:**
- All modified files.

- [ ] **Step 1: Jalankan TypeScript type check**

  Run:
  ```bash
  npm run typecheck
  ```
  Expected: exit 0, no errors.

- [ ] **Step 2: Jalankan linter**

  Run:
  ```bash
  npm run lint
  ```
  Expected: exit 0, no errors.

- [ ] **Step 3: Verifikasi SQL files**

  Run:
  ```bash
  grep -n "CREATE TABLE" supabase/migrations/setup_complete_laundry.sql
  grep -n "INSERT INTO" supabase/migrations/seed_laundry.sql
  ```
  Expected: semua tabel dan seed memakai suffix `_laundry`.

---

## Self-Review Checklist

- [ ] Semua tabel lama memiliki pasangan `_laundry` di schema.
- [ ] Tidak ada nama tabel lama yang tersisa di `.from('...')`.
- [ ] Bucket storage `payment-proofs` tidak ikut ter-rename.
- [ ] TypeScript typecheck lolos.
- [ ] Linter lolos.
