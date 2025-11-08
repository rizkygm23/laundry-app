# 🔐 Setup Autentikasi

## Fitur yang Sudah Ditambahkan

1. ✅ **Halaman Login** (`/login`)
2. ✅ **Halaman Register** (`/register`)
3. ✅ **Auth Context** untuk manage user session
4. ✅ **Protected Routes** untuk halaman yang memerlukan login
5. ✅ **User Profile** di header dengan dropdown logout
6. ✅ **Auto-redirect** ke login jika belum authenticated

## Setup Database untuk Auth

### Langkah 1: Update Users Table

Jalankan migration untuk update tabel users agar kompatibel dengan Supabase Auth:

File: `supabase/migrations/update_users_table_for_auth.sql`

**Cara menjalankan:**
1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file `update_users_table_for_auth.sql`
3. Paste dan jalankan

### Langkah 2: Enable Auth Policies (Optional)

Jika ingin **hanya authenticated users** yang bisa mengakses data (lebih aman), jalankan:

File: `supabase/migrations/enable_auth_policies.sql`

**Catatan:** 
- Migration ini akan membuat data hanya bisa diakses oleh user yang sudah login
- Halaman status public (`/status/[kode]`) tetap bisa diakses tanpa login
- Jika belum siap, bisa skip migration ini dan tetap menggunakan anon policies

## Cara Menggunakan

### 1. Register User Baru

1. Buka aplikasi → akan redirect ke `/login`
2. Klik "Daftar sekarang"
3. Isi form register:
   - Nama Lengkap
   - Email
   - Password (minimal 6 karakter)
   - Konfirmasi Password
4. Klik "Daftar"
5. Setelah berhasil, akan redirect ke halaman login

### 2. Login

1. Buka `/login`
2. Masukkan email dan password
3. Klik "Login"
4. Setelah berhasil, akan redirect ke dashboard (`/`)

### 3. Logout

1. Klik avatar/user icon di pojok kanan atas
2. Klik "Logout"
3. Akan redirect ke halaman login

## Halaman yang Memerlukan Login

- `/` - Dashboard (Home)
- `/transaksi/create` - Buat transaksi baru
- Semua halaman manajemen data

## Halaman Public (Tidak Perlu Login)

- `/login` - Halaman login
- `/register` - Halaman register
- `/status/[kode]` - Cek status transaksi (public)
- `/struk/[kode]` - Struk transaksi (public)
- `/qr/[kode]` - QR Code (public)

## Struktur File

```
app/
  ├── login/
  │   └── page.tsx          # Halaman login
  ├── register/
  │   └── page.tsx          # Halaman register
  └── page.tsx              # Dashboard (protected)

contexts/
  └── AuthContext.tsx       # Auth context/provider

components/
  └── auth/
      └── ProtectedRoute.tsx # Component untuk protect routes
```

## Troubleshooting

### Error: "User already registered"

- Email sudah terdaftar, gunakan email lain atau login dengan email tersebut

### Error: "Invalid login credentials"

- Email atau password salah
- Pastikan user sudah terdaftar
- Cek di Supabase Dashboard > Authentication > Users

### Error: "Failed to create user profile"

- Cek apakah migration `update_users_table_for_auth.sql` sudah dijalankan
- Cek RLS policies untuk tabel users
- Cek browser console untuk error detail

### User tidak bisa login setelah register

1. Cek email untuk verifikasi (jika email confirmation enabled)
2. Cek di Supabase Dashboard > Authentication > Users apakah user sudah dibuat
3. Pastikan password sudah benar

### Data tidak tersimpan setelah login

1. Pastikan RLS policies sudah diupdate
2. Jika menggunakan `enable_auth_policies.sql`, pastikan user sudah login
3. Cek browser console untuk error detail

## Catatan Penting

1. **Supabase Auth** menggunakan email/password authentication
2. Password di-hash secara otomatis oleh Supabase
3. Session di-persist di browser (localStorage)
4. User profile disimpan di tabel `users` dengan `id` yang sama dengan `auth.users.id`
5. RLS policies menggunakan `auth.uid()` untuk check user yang sedang login

## Next Steps

1. ✅ Setup email verification (optional)
2. ✅ Add password reset functionality
3. ✅ Add user profile editing
4. ✅ Add role-based access control (admin, staff, etc.)

