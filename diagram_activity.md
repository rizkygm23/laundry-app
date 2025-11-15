# Activity Diagram - Laundry Management System (Simplified)

Activity Diagram yang disederhanakan dengan fokus pada interaksi antara User dan Sistem.

## 1. Activity Diagram - Buat Transaksi

### Format Mermaid

```mermaid
flowchart TD
    subgraph User["👤 User (Admin)"]
        U1[1. Login ke Sistem]
        U2[2. Input Data Pelanggan]
        U3[3. Pilih Layanan & Jumlah]
        U4[4. Submit Transaksi]
        U5[5. Pilih Bayar Langsung?]
        U6[6. Input Pembayaran]
    end
    
    subgraph System["⚙️ Sistem"]
        S1[1. Validasi Login]
        S2[2. Auto-fill Data Pelanggan]
        S3[3. Hitung Total Harga]
        S4[4. Generate Kode Struk]
        S5[5. Simpan Transaksi]
        S6[6. Update Status Pembayaran]
        S7[7. Tampilkan Success]
    end
    
    Start([Start]) --> U1
    U1 --> S1
    S1 -->|Valid| U2
    S1 -->|Invalid| U1
    U2 --> S2
    S2 --> U3
    U3 --> S3
    S3 --> U4
    U4 --> S4
    S4 --> S5
    S5 --> U5
    U5 -->|Ya| U6
    U5 -->|Tidak| S7
    U6 --> S6
    S6 --> S7
    S7 --> End([End])
```

### Format PlantUML

```plantuml
@startuml
title Activity Diagram - Buat Transaksi

|#LightBlue|User|
start
:Login ke Sistem;

|#LightGreen|Sistem|
:Validasi Login;
if (Login Valid?) then (tidak)
  |#LightBlue|User|
  :Login ke Sistem;
else (ya)
  |#LightBlue|User|
  :Input Data Pelanggan;
  
  |#LightGreen|Sistem|
  :Auto-fill Data Pelanggan\ndari Database;
  
  |#LightBlue|User|
  :Pilih Layanan & Jumlah;
  
  |#LightGreen|Sistem|
  :Hitung Total Harga;
  
  |#LightBlue|User|
  :Submit Transaksi;
  
  |#LightGreen|Sistem|
  :Generate Kode Struk;
  :Simpan Transaksi;
  
  |#LightBlue|User|
  if (Bayar Langsung?) then (ya)
    :Input Metode Pembayaran;
    |#LightGreen|Sistem|
    :Update Status Pembayaran;
  else (tidak)
  endif
  
  |#LightGreen|Sistem|
  :Tampilkan Success Message;
  
  |#LightBlue|User|
stop

@enduml
```

---

## 2. Activity Diagram - Update Status Transaksi

### Format Mermaid

```mermaid
flowchart TD
    subgraph User["👤 User (Admin)"]
        U1[1. Pilih Transaksi]
        U2[2. Klik Update Status]
        U3[3. Pilih Status Baru]
        U4[4. Konfirmasi Update]
    end
    
    subgraph System["⚙️ Sistem"]
        S1[1. Tampilkan Daftar Transaksi]
        S2[2. Validasi Status]
        S3[3. Update Database]
        S4[4. Real-time Update]
        S5[5. Tampilkan Konfirmasi]
    end
    
    Start([Start]) --> S1
    S1 --> U1
    U1 --> U2
    U2 --> S2
    S2 --> U3
    U3 --> U4
    U4 --> S3
    S3 --> S4
    S4 --> S5
    S5 --> End([End])
```

### Format PlantUML

```plantuml
@startuml
title Activity Diagram - Update Status Transaksi

|#LightGreen|Sistem|
start
:Tampilkan Daftar Transaksi;

|#LightBlue|User|
:Pilih Transaksi;
:Klik Update Status;
:Pilih Status Baru\n(Antrian → Proses → Selesai);

|#LightGreen|Sistem|
:Validasi Status;
:Update Database;
:Real-time Update\nto Pelanggan;

|#LightBlue|User|
:Tampilkan Konfirmasi;
stop

@enduml
```

---

## 3. Activity Diagram - Update Status Pembayaran

### Format Mermaid

```mermaid
flowchart TD
    subgraph User["👤 User (Admin)"]
        U1[1. Pilih Transaksi]
        U2[2. Klik Bayar]
        U3[3. Pilih Metode Pembayaran]
        U4[4. Upload Bukti Pembayaran?]
        U5[5. Konfirmasi Pembayaran]
    end
    
    subgraph System["⚙️ Sistem"]
        S1[1. Buka Modal Payment]
        S2[2. Validasi Data]
        S3[3. Simpan Bukti Pembayaran]
        S4[4. Update Status ke Lunas]
        S5[5. Tampilkan Konfirmasi]
    end
    
    Start([Start]) --> U1
    U1 --> U2
    U2 --> S1
    S1 --> U3
    U3 --> U4
    U4 -->|Ya| S3
    U4 -->|Tidak| S4
    U3 --> S2
    S2 -->|Valid| U5
    S2 -->|Invalid| U3
    S3 --> S4
    U5 --> S4
    S4 --> S5
    S5 --> End([End])
```

### Format PlantUML

```plantuml
@startuml
title Activity Diagram - Update Status Pembayaran

|#LightBlue|User|
start
:Pilih Transaksi;
:Klik Bayar;

|#LightGreen|Sistem|
:Buka Modal Payment;

|#LightBlue|User|
:Pilih Metode Pembayaran\n(Tunai/Transfer/E-Wallet/QRIS);

|#LightGreen|Sistem|
:Validasi Data;

|#LightBlue|User|
if (Upload Bukti Pembayaran?) then (ya)
  :Upload File Bukti;
  |#LightGreen|Sistem|
  :Simpan Bukti Pembayaran\ndi Storage;
else (tidak)
endif

|#LightBlue|User|
:Konfirmasi Pembayaran;

|#LightGreen|Sistem|
:Update Status ke Lunas;
:Tampilkan Konfirmasi;

|#LightBlue|User|
stop

@enduml
```

---

## 4. Activity Diagram - Cek Status Transaksi (Pelanggan)

### Format Mermaid

```mermaid
flowchart TD
    subgraph Pelanggan["👤 Pelanggan"]
        P1[1. Scan QR Code atau\nMasukkan Kode Struk]
        P2[2. Lihat Status Transaksi]
        P3[3. Wait untuk Update Status]
    end
    
    subgraph System["⚙️ Sistem"]
        S1[1. Validasi Kode Struk]
        S2[2. Load Data Transaksi]
        S3[3. Tampilkan Status]
        S4[4. Subscribe Real-time]
        S5[5. Auto-update Status]
    end
    
    Start([Start]) --> P1
    P1 --> S1
    S1 -->|Valid| S2
    S1 -->|Invalid| Error[Kode Tidak Ditemukan]
    S2 --> S3
    S3 --> S4
    S4 --> P2
    P2 --> P3
    P3 --> S5
    S5 --> P2
    Error --> End([End])
    P3 --> End
```

### Format PlantUML

```plantuml
@startuml
title Activity Diagram - Cek Status Transaksi (Pelanggan)

|#Yellow|Pelanggan|
start
:Scan QR Code atau\nMasukkan Kode Struk;

|#LightGreen|Sistem|
if (Kode Valid?) then (tidak)
  :Tampilkan Error:\nKode Tidak Ditemukan;
  stop
else (ya)
  :Load Data Transaksi;
  :Tampilkan Status:\n- Status Transaksi\n- Status Pembayaran\n- Info Transaksi;
  :Subscribe Real-time Update;
  
  |#Yellow|Pelanggan|
  :Lihat Status Transaksi;
  
  |#LightGreen|Sistem|
  :Auto-update Status\nsaat Admin Update;
  
  |#Yellow|Pelanggan|
  :Status Terupdate Otomatis;
endif

stop

@enduml
```

---

## 5. Activity Diagram - Login & Register

### Format Mermaid

```mermaid
flowchart TD
    subgraph User["👤 User"]
        U1[1. Akses Halaman Login]
        U2[2a. Input Email & Password]
        U2B[2b. Klik Register]
        U3[3b. Input Data Registrasi]
        U4[4b. Submit Register]
        U5[5. Submit Login]
    end
    
    subgraph System["⚙️ Sistem"]
        S1[1. Validasi Credentials]
        S2[2. Authenticate User]
        S3[3. Validasi Data Register]
        S4[4. Create Account]
        S5[5. Set Session]
        S6[6. Redirect ke Dashboard]
    end
    
    Start([Start]) --> U1
    U1 -->|Login| U2
    U1 -->|Register| U2B
    U2 --> U5
    U5 --> S1
    S1 -->|Valid| S2
    S1 -->|Invalid| Error1[Tampilkan Error]
    S2 --> S5
    S5 --> S6
    S6 --> End([End])
    Error1 --> U2
    U2B --> U3
    U3 --> U4
    U4 --> S3
    S3 -->|Valid| S4
    S3 -->|Invalid| Error2[Tampilkan Error]
    S4 --> U1
    Error2 --> U3
```

### Format PlantUML

```plantuml
@startuml
title Activity Diagram - Login & Register

|#LightBlue|User|
start
:Akses Halaman Login;

if (Pilih Aksi?) then (Login)
  :Input Email & Password;
  |#LightGreen|Sistem|
  :Validasi Credentials;
  if (Valid?) then (tidak)
    :Tampilkan Error;
    |#LightBlue|User|
    :Input Email & Password;
  else (ya)
    :Authenticate User;
    :Set Session;
    :Redirect ke Dashboard;
    stop
  endif
else (Register)
  |#LightBlue|User|
  :Input Data:\nNama, Email, Password;
  |#LightGreen|Sistem|
  :Validasi Data;
  if (Valid?) then (tidak)
    :Tampilkan Error;
    |#LightBlue|User|
    :Input Data;
  else (ya)
    :Create Account;
    :Redirect ke Login;
    |#LightBlue|User|
    :Input Email & Password;
    |#LightGreen|Sistem|
    :Authenticate User;
    :Set Session;
    :Redirect ke Dashboard;
    stop
  endif
endif

@enduml
```

---

## 6. Activity Diagram - Manajemen Pengeluaran

### Format Mermaid

```mermaid
flowchart TD
    subgraph User["👤 User (Admin)"]
        U1[1. Akses Halaman Keuangan]
        U2[2. Pilih Timeframe]
        U3[3. Tambah/Edit/Hapus Pengeluaran]
        U4[4. Input Data Pengeluaran]
        U5[5. Submit]
    end
    
    subgraph System["⚙️ Sistem"]
        S1[1. Load Data Transaksi & Pengeluaran]
        S2[2. Filter by Timeframe]
        S3[3. Hitung Statistik]
        S4[4. Tampilkan Laporan]
        S5[5. Validasi Data]
        S6[6. Simpan/Update/Hapus]
        S7[7. Refresh Laporan]
    end
    
    Start([Start]) --> U1
    U1 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> U2
    U2 --> S2
    S4 --> U3
    U3 --> U4
    U4 --> U5
    U5 --> S5
    S5 -->|Valid| S6
    S5 -->|Invalid| Error[Tampilkan Error]
    S6 --> S7
    S7 --> S4
    Error --> U4
```

### Format PlantUML

```plantuml
@startuml
title Activity Diagram - Manajemen Pengeluaran

|#LightBlue|User|
start
:Akses Halaman Keuangan;

|#LightGreen|Sistem|
:Load Data Transaksi & Pengeluaran;
:Pilih Timeframe\n(Hari/Minggu/Bulan/Tahun);
:Filter Data;
:Hitung Statistik:\nPendapatan, Pengeluaran, Saldo;
:Tampilkan Laporan;

|#LightBlue|User|
if (Aksi?) then (Tambah)
  :Input Data Pengeluaran:\nKategori, Deskripsi, Jumlah;
  |#LightGreen|Sistem|
  :Validasi Data;
  if (Valid?) then (tidak)
    :Tampilkan Error;
    |#LightBlue|User|
    :Input Data Pengeluaran;
  else (ya)
    :Simpan Pengeluaran;
    :Refresh Laporan;
    :Tampilkan Laporan;
  endif
elseif (Edit) then
  :Pilih Pengeluaran;
  :Edit Data;
  |#LightGreen|Sistem|
  :Update Pengeluaran;
  :Refresh Laporan;
elseif (Hapus) then
  :Pilih Pengeluaran;
  :Konfirmasi Hapus;
  |#LightGreen|Sistem|
  :Hapus Pengeluaran;
  :Refresh Laporan;
endif

stop

@enduml
```

---

## Cara Menggunakan

### Mermaid
- **GitHub/GitLab**: Copy langsung ke file `.md`
- **Notion**: Gunakan block `/mermaid`
- **VS Code**: Install "Markdown Preview Mermaid Support"
- **Online**: [Mermaid Live Editor](https://mermaid.live)

### PlantUML
- **VS Code**: Install extension "PlantUML"
- **IntelliJ**: Built-in support
- **Online**: [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
- **Draw.io**: Import dari text
