# 🔧 Troubleshooting Guide

## ❌ Error: "Could not find the table 'public.layanan' in the schema cache"

Jika Anda sudah membuat tabel di Supabase (seperti screenshot yang menunjukkan RLS Enabled), tapi masih dapat error ini, coba langkah-langkah berikut:

### 1. ✅ Pastikan Environment Variables Sudah Di-Set

Buat file `.env.local` di root project (sama level dengan `package.json`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Cara mendapatkan URL dan Key:**
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik **Settings** → **API**
4. Copy **Project URL** → paste ke `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon/public key** → paste ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. 🔄 Restart Development Server

Setelah membuat/update `.env.local`:

```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

**PENTING:** Next.js hanya membaca environment variables saat server start. Setelah update `.env.local`, HARUS restart server!

### 3. 🧹 Clear Browser Cache

1. Buka browser console (F12)
2. Klik kanan pada tombol refresh
3. Pilih **"Empty Cache and Hard Reload"**
4. Atau buka **Incognito/Private window** untuk test

### 4. 🔍 Test Koneksi Supabase

Tambahkan script test di halaman sementara untuk debug:

```typescript
// Di browser console, jalankan:
import { supabase } from '@/lib/supabase';

// Test query
const { data, error } = await supabase
  .from('layanan')
  .select('*')
  .limit(1);

console.log('Data:', data);
console.log('Error:', error);
```

### 5. ✅ Verifikasi Tabel di Supabase Dashboard

1. Buka **Supabase Dashboard** → **Table Editor**
2. Pastikan tabel `layanan`, `pelanggan`, `transaksi` ada
3. Coba insert data manual melalui Table Editor untuk test

### 6. 🔄 Refresh Schema Cache di Supabase

Kadang schema cache di Supabase perlu di-refresh. Coba:

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Jalankan query ini:

```sql
-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
```

3. Tunggu beberapa detik
4. Refresh browser aplikasi

### 7. 🐛 Check Browser Console untuk Error Detail

1. Buka browser console (F12)
2. Cari error message yang lebih detail
3. Error biasanya menunjukkan masalah spesifik:
   - **"Missing environment variables"** → Set `.env.local`
   - **"Invalid API key"** → Check anon key
   - **"RLS policy violation"** → Jalankan `fix_anon_policies.sql`
   - **"Table not found"** → Tabel belum dibuat atau cache issue

### 8. 🔐 Verifikasi RLS Policies

Jalankan query ini di SQL Editor untuk cek policies:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('layanan', 'pelanggan', 'transaksi')
ORDER BY tablename, policyname;
```

Pastikan ada policies dengan `roles` = `{anon,authenticated}` untuk semua operasi (SELECT, INSERT, UPDATE, DELETE).

### 9. 🆕 Re-run Setup SQL

Jika masih error, coba re-run `setup_complete.sql`:

1. Buka file `supabase/migrations/setup_complete.sql`
2. Copy semua isi
3. Paste ke SQL Editor
4. Run lagi (aman untuk di-run berulang kali)

### 10. 📞 Checklist Final

Sebelum minta bantuan, pastikan:

- [ ] File `.env.local` sudah dibuat dan berisi URL + Key yang benar
- [ ] Development server sudah di-restart setelah update `.env.local`
- [ ] Tabel sudah dibuat (cek di Table Editor)
- [ ] RLS policies sudah dibuat (cek dengan verify_tables.sql)
- [ ] Browser cache sudah di-clear
- [ ] Tidak ada error di browser console
- [ ] Tidak ada error di Supabase Dashboard > Logs

## 🎯 Quick Fix Checklist

Jika error masih muncul, coba urut ini:

1. ✅ **Buat/Update `.env.local`** dengan URL dan Key yang benar
2. ✅ **Restart development server** (Ctrl+C lalu `npm run dev`)
3. ✅ **Clear browser cache** atau buka Incognito
4. ✅ **Re-run `setup_complete.sql`** di Supabase
5. ✅ **Refresh schema cache** dengan `NOTIFY pgrst, 'reload schema';`
6. ✅ **Check browser console** untuk error detail
7. ✅ **Test koneksi** dengan query manual di SQL Editor

## 💡 Tips

- Environment variables di Next.js harus dimulai dengan `NEXT_PUBLIC_` untuk bisa diakses di client
- Setelah update `.env.local`, **HARUS restart server**
- Supabase schema cache kadang perlu waktu beberapa detik untuk update
- Gunakan browser console (F12) untuk melihat error detail

## 🆘 Masih Error?

Jika semua langkah di atas sudah dilakukan tapi masih error:

1. Screenshot error message dari browser console
2. Screenshot hasil query di Supabase SQL Editor
3. Pastikan environment variables sudah di-set (jangan share value-nya!)
4. Cek Supabase Dashboard > Logs untuk error server-side

