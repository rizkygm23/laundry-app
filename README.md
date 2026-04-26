# 🧺 Sistem Manajemen Laundry (Laundry App)

Sebuah aplikasi manajemen laundry modern yang dibangun menggunakan **Next.js**, **Supabase**, dan **Tailwind CSS**. Aplikasi ini dirancang untuk memudahkan pemilik usaha laundry dalam mengelola transaksi, layanan, pelanggan, hingga mencetak struk digital dengan QR Code untuk pelacakan status pesanan secara *real-time*.

## ✨ Fitur Utama

- **Dashboard Interaktif**: Statistik transaksi, status pesanan, dan ringkasan pendapatan.
- **Manajemen Transaksi**: Pembuatan pesanan baru dengan kalkulasi harga dan estimasi waktu selesai secara otomatis.
- **Manajemen Layanan & Pelanggan**: Kelola daftar layanan (kiloan/satuan) dan data pelanggan dengan mudah.
- **Struk Digital & QR Code**: Otomatis membuat struk digital yang dilengkapi QR Code. Pelanggan dapat memindai QR Code untuk mengecek status cucian mereka.
- **Pelacakan Status Publik**: Halaman khusus bagi pelanggan untuk memantau status pesanan mereka (*Antrian, Proses, Selesai*) tanpa perlu login.
- **Integrasi Peta (Delivery)**: Fitur pemilihan lokasi pengiriman/penjemputan pakaian menggunakan peta interaktif.
- **Kirim via WhatsApp**: Kirim struk langsung ke WhatsApp pelanggan dengan satu klik.

## 🛠️ Tech Stack

- **Framework:** [Next.js 13](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database & Backend:** [Supabase](https://supabase.com/) (PostgreSQL & Realtime)
- **Maps:** [Leaflet](https://leafletjs.com/) & React Leaflet
- **Form & Validation:** React Hook Form & Zod
- **Icons:** Lucide React
- **QR Code:** html5-qrcode & qrcode

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal/menyiapkan hal-hal berikut:
- **Node.js** (Versi 16 atau lebih baru)
- **npm** atau **yarn** atau **pnpm**
- Akun **[Supabase](https://supabase.com/)** (untuk database backend)

## 🚀 Panduan Instalasi & Setup

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi secara lokal:

### 1. Clone Repository
```bash
git clone https://github.com/username/laundry-app.git
cd laundry-app
```

### 2. Install Dependensi
```bash
npm install
# atau
yarn install
```

### 3. Setup Environment Variables
Buat file `.env.local` di root direktori project dan tambahkan kredensial Supabase Anda. Anda dapat menggunakan file `.env.example` sebagai referensi jika ada, atau buat dari awal:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

### 4. Setup Database Supabase
Aplikasi ini membutuhkan struktur tabel `layanan`, `pelanggan`, dan `transaksi`.
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) -> **SQL Editor**
2. Buka file `supabase/migrations/setup_complete.sql` yang ada di repository ini.
3. Salin seluruh isi file dan jalankan di SQL Editor Supabase.
4. Pastikan query berhasil dieksekusi tanpa error.

> 💡 **Catatan**: Untuk panduan lengkap tentang Database, Auth, dan Troubleshooting lebih detail, silakan merujuk ke file `README-SETUP.md`, `SETUP-DATABASE.md`, dan `TROUBLESHOOTING.md` di dalam direktori project.

### 5. Jalankan Aplikasi
```bash
npm run dev
# atau
yarn dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat dan mulai menggunakan aplikasi.

## 📂 Struktur Direktori

```text
laundry-app/
├── app/                  # Next.js App Router (Pages, Layouts, API)
├── components/           # Reusable UI Components (UI, Map, Booking)
├── contexts/             # React Context Providers
├── hooks/                # Custom React Hooks
├── lib/                  # Utility functions (Supabase client, formatters)
├── public/               # Static assets
└── supabase/             # Schema database & migrations SQL
```

## 📸 Screenshot

*(Ganti URL gambar di bawah dengan screenshot asli aplikasi Anda setelah di-publish)*

| Dashboard Utama | Form Transaksi |
|-----------------|----------------|
| ![Dashboard](https://via.placeholder.com/600x350/f8fafc/0f172a?text=Dashboard+Aplikasi) | ![Transaksi](https://via.placeholder.com/600x350/f8fafc/0f172a?text=Manajemen+Transaksi) |

| Struk & QR Code | Cek Status Publik |
|-----------------|-------------------|
| ![Struk](https://via.placeholder.com/600x350/f8fafc/0f172a?text=Cetak+Struk+&+QR+Code) | ![Status](https://via.placeholder.com/600x350/f8fafc/0f172a?text=Halaman+Cek+Status) |

## 🤝 Kontribusi

Kontribusi selalu diterima! Jika Anda menemukan bug atau memiliki ide fitur baru, silakan buka *Issue* atau buat *Pull Request*.

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk informasi lebih lanjut.

---
Dibuat dengan ❤️ untuk mempermudah digitalisasi UMKM Laundry.
