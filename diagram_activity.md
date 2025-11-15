# Activity Diagram - Laundry Management System

## Activity Diagram untuk Use Case Utama

### 1. Activity Diagram - Buat Transaksi

#### Format Mermaid

```mermaid
flowchart TD
    Start([Start]) --> Login{User Login?}
    Login -->|No| Redirect[Redirect ke Login]
    Redirect --> Login
    Login -->|Yes| Access[Akses Halaman Create Transaksi]
    Access --> InputPelanggan[Input Data Pelanggan]
    InputPelanggan --> CheckNomorHP{Input Nomor HP}
    CheckNomorHP -->|Nomor HP > 10 digit| AutoFill[Auto-fill Data Pelanggan dari Database]
    CheckNomorHP -->|Nomor HP < 10 digit| ManualInput[Input Manual Nama & Alamat]
    AutoFill --> AddItem[Tambah Item Layanan]
    ManualInput --> AddItem
    AddItem --> PilihLayanan[Pilih Layanan dari Dropdown]
    PilihLayanan --> InputJumlah[Input Jumlah kg/pcs]
    InputJumlah --> CheckLayanan{Ada Layanan yang Dipilih?}
    CheckLayanan -->|No| PilihLayanan
    CheckLayanan -->|Yes| AddMoreItem{Tambah Item Lagi?}
    AddMoreItem -->|Yes| AddItem
    AddMoreItem -->|No| CalculateTotal[Hitung Total Harga Otomatis]
    CalculateTotal --> CheckForm{Form Valid?}
    CheckForm -->|No| ShowError[Tampilkan Error Message]
    ShowError --> InputPelanggan
    CheckForm -->|Yes| GenerateKode[Generate Kode Struk Otomatis]
    GenerateKode --> CalculateDeadline[Hitung Deadline Otomatis]
    CalculateDeadline --> SavePelanggan{Perlu Simpan/Update Pelanggan?}
    SavePelanggan -->|Yes| InsertPelanggan[Insert/Update Data Pelanggan]
    SavePelanggan -->|No| CreateTransaksi
    InsertPelanggan --> CreateTransaksi[Create Transaksi di Database]
    CreateTransaksi --> CheckPayment{Bayar Langsung?}
    CheckPayment -->|Yes| OpenPayment[Buka Modal Payment]
    CheckPayment -->|No| ShowSuccess[Tampilkan Success Message]
    OpenPayment --> InputPayment[Input Metode Pembayaran]
    InputPayment --> UploadBukti{Upload Bukti Pembayaran?}
    UploadBukti -->|Yes| UploadFile[Upload File Bukti Pembayaran]
    UploadBukti -->|No| UpdatePayment
    UploadFile --> UpdatePayment[Update Status Pembayaran ke Lunas]
    UpdatePayment --> ShowSuccess
    ShowSuccess --> RedirectDetail[Redirect ke Detail Transaksi]
    RedirectDetail --> End([End])
```

#### Format PlantUML

```plantuml
@startuml
title Activity Diagram - Buat Transaksi

|#LightBlue|Admin|
start
:User Login?;
if (User belum login?) then (yes)
  :Redirect ke Login;
  stop
else (no)
endif

:Akses Halaman Create Transaksi;
:Input Data Pelanggan;

|#LightGreen|Sistem|
if (Input Nomor HP?) then (Nomor HP > 10 digit)
  :Auto-fill Data Pelanggan dari Database;
else (Nomor HP < 10 digit)
  :Input Manual Nama & Alamat;
endif

|#LightBlue|Admin|
:Tambah Item Layanan;
:Pilih Layanan dari Dropdown;
:Input Jumlah kg/pcs;

|#LightGreen|Sistem|
if (Ada Layanan yang Dipilih?) then (no)
  stop
else (yes)
endif

|#LightBlue|Admin|
if (Tambah Item Lagi?) then (yes)
  :Tambah Item Layanan;
else (no)
endif

|#LightGreen|Sistem|
:Hitung Total Harga Otomatis;

if (Form Valid?) then (no)
  :Tampilkan Error Message;
  stop
else (yes)
endif

:Generate Kode Struk Otomatis;
:Hitung Deadline Otomatis;

if (Perlu Simpan/Update Pelanggan?) then (yes)
  :Insert/Update Data Pelanggan;
else (no)
endif

:Create Transaksi di Database;

|#LightBlue|Admin|
if (Bayar Langsung?) then (yes)
  :Buka Modal Payment;
  :Input Metode Pembayaran;
  
  if (Upload Bukti Pembayaran?) then (yes)
    :Upload File Bukti Pembayaran;
  else (no)
  endif
  
  |#LightGreen|Sistem|
  :Update Status Pembayaran ke Lunas;
else (no)
endif

|#LightGreen|Sistem|
:Tampilkan Success Message;
:Redirect ke Detail Transaksi;

stop
@enduml
```

---

### 2. Activity Diagram - Update Status Transaksi

#### Format Mermaid

```mermaid
flowchart TD
    Start([Start]) --> Login{User Login?}
    Login -->|No| Redirect[Redirect ke Login]
    Redirect --> Login
    Login -->|Yes| ViewTransaksi[View Daftar Transaksi]
    ViewTransaksi --> SelectTransaksi[Pilih Transaksi]
    SelectTransaksi --> ViewDetail[Lihat Detail Transaksi]
    ViewDetail --> CheckStatus{Status Transaksi}
    CheckStatus -->|Antrian| UpdateToProses[Update ke 'Proses']
    CheckStatus -->|Proses| UpdateToSelesai[Update ke 'Selesai']
    CheckStatus -->|Selesai| ShowMessage[Transaksi Sudah Selesai]
    UpdateToProses --> SaveStatus[Simpan Status ke Database]
    UpdateToSelesai --> SaveStatus
    SaveStatus --> RealTimeUpdate[Update Real-time via Supabase]
    RealTimeUpdate --> NotifyPelanggan{Pelanggan Sedang Cek Status?}
    NotifyPelanggan -->|Yes| AutoUpdateView[Auto-update Halaman Status Pelanggan]
    NotifyPelanggan -->|No| Continue
    AutoUpdateView --> Continue
    ShowMessage --> Continue[Continue]
    Continue --> RefreshList[Refresh Daftar Transaksi]
    RefreshList --> End([End])
```

---

### 3. Activity Diagram - Update Status Pembayaran

#### Format Mermaid

```mermaid
flowchart TD
    Start([Start]) --> Login{User Login?}
    Login -->|No| Redirect[Redirect ke Login]
    Redirect --> Login
    Login -->|Yes| ViewTransaksi[View Daftar Transaksi]
    ViewTransaksi --> SelectTransaksi[Pilih Transaksi]
    SelectTransaksi --> CheckPayment{Status Pembayaran}
    CheckPayment -->|Lunas| ShowMessage[Transaksi Sudah Lunas]
    CheckPayment -->|Belum Lunas| OpenPayment[Buka Modal Payment]
    OpenPayment --> SelectMethod[Pilih Metode Pembayaran]
    SelectMethod --> CheckMethod{Metode Pembayaran}
    CheckMethod -->|Tunai| DirectUpdate[Langsung Update ke Lunas]
    CheckMethod -->|Transfer/E-Wallet/QRIS| UploadProof[Upload Bukti Pembayaran]
    UploadProof --> ValidateFile{File Valid?}
    ValidateFile -->|No| ShowError[Tampilkan Error]
    ShowError --> UploadProof
    ValidateFile -->|Yes| SaveToStorage[Simpan File ke Supabase Storage]
    SaveToStorage --> GetURL[Get URL Bukti Pembayaran]
    GetURL --> UpdatePayment[Update Status Pembayaran ke Lunas]
    DirectUpdate --> UpdatePayment
    UpdatePayment --> SavePaymentStatus[Simpan ke Database]
    SavePaymentStatus --> RealTimeUpdate[Update Real-time]
    RealTimeUpdate --> ShowSuccess[Tampilkan Success Message]
    ShowMessage --> Continue
    ShowSuccess --> Continue[Continue]
    Continue --> RefreshList[Refresh Daftar Transaksi]
    RefreshList --> End([End])
```

---

### 4. Activity Diagram - Cek Status Transaksi (Pelanggan)

#### Format Mermaid

```mermaid
flowchart TD
    Start([Start]) --> AccessPublic[Akses Halaman Status /status/kode]
    AccessPublic --> LoadTransaksi[Load Data Transaksi dari Database]
    LoadTransaksi --> CheckKode{Kode Valid?}
    CheckKode -->|No| ShowNotFound[Show: Kode Tidak Ditemukan]
    CheckKode -->|Yes| DisplayStatus[Tampilkan Status Transaksi]
    DisplayStatus --> SubscribeRealtime[Subscribe ke Supabase Realtime]
    SubscribeRealtime --> DisplayInfo[Tampilkan Info: Kode, Nama, Layanan, Total]
    DisplayInfo --> DisplayStatusTransaksi[Display Status: Antrian/Proses/Selesai]
    DisplayStatusTransaksi --> DisplayPaymentStatus[Display Status Pembayaran]
    DisplayPaymentStatus --> WaitUpdate{Wait for Updates}
    WaitUpdate -->|Status Berubah| AutoRefresh[Auto-refresh Status Display]
    WaitUpdate -->|No Update| Continue
    AutoRefresh --> WaitUpdate
    Continue --> CheckUpdate{User Refresh Page?}
    CheckUpdate -->|Yes| LoadTransaksi
    CheckUpdate -->|No| End([End])
    ShowNotFound --> End
```

---

### 5. Activity Diagram - Login & Register

#### Format Mermaid

```mermaid
flowchart TD
    Start([Start]) --> CheckAuth{Sudah Login?}
    CheckAuth -->|Yes| RedirectDashboard[Redirect ke Dashboard]
    RedirectDashboard --> End([End])
    CheckAuth -->|No| ShowLogin[Show Halaman Login]
    ShowLogin --> SelectAction{Pilih Aksi}
    SelectAction -->|Login| InputLogin[Input Email & Password]
    SelectAction -->|Register| GoRegister[Go to Register Page]
    InputLogin --> ValidateLogin{Validate Login}
    ValidateLogin -->|Invalid| ShowError[Show Error Message]
    ShowError --> InputLogin
    ValidateLogin -->|Valid| Authenticate[Authenticate via Supabase]
    Authenticate --> CheckAuthSuccess{Login Berhasil?}
    CheckAuthSuccess -->|No| ShowError
    CheckAuthSuccess -->|Yes| SetSession[Set User Session]
    SetSession --> RedirectDashboard
    
    GoRegister --> InputRegister[Input: Nama, Email, Password, Confirm Password]
    InputRegister --> ValidateRegister{Validate Form}
    ValidateRegister -->|Invalid| ShowErrorReg[Show Error Message]
    ShowErrorReg --> InputRegister
    ValidateRegister -->|Valid| CheckPassword{Password Match?}
    CheckPassword -->|No| ShowErrorReg
    CheckPassword -->|Yes| CreateAccount[Create Account via Supabase]
    CreateAccount --> CheckCreateSuccess{Account Created?}
    CheckCreateSuccess -->|No| ShowErrorReg
    CheckCreateSuccess -->|Yes| ShowSuccessReg[Show Success Message]
    ShowSuccessReg --> ShowLogin
```

---

### 6. Activity Diagram - Manajemen Pengeluaran

#### Format Mermaid

```mermaid
flowchart TD
    Start([Start]) --> Login{User Login?}
    Login -->|No| Redirect[Redirect ke Login]
    Redirect --> Login
    Login -->|Yes| AccessKeuangan[Akses Halaman Keuangan]
    AccessKeuangan --> SelectTimeframe[Pilih Timeframe: Hari Ini/Seminggu/Sebulan/Tahun]
    SelectTimeframe --> LoadData[Load Data Transaksi & Pengeluaran]
    LoadData --> DisplayStats[Tampilkan Statistik: Pendapatan, Pengeluaran, Saldo Kas]
    DisplayStats --> SelectAction{Pilih Aksi}
    SelectAction -->|Tambah Pengeluaran| OpenDialog[Buka Dialog Tambah Pengeluaran]
    SelectAction -->|Edit Pengeluaran| SelectPengeluaran[Pilih Pengeluaran]
    SelectAction -->|Hapus Pengeluaran| ConfirmDelete{Konfirmasi Hapus}
    SelectAction -->|View Only| End([End])
    
    OpenDialog --> InputPengeluaran[Input: Kategori, Deskripsi, Jumlah, Tanggal]
    InputPengeluaran --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowError[Tampilkan Error]
    ShowError --> InputPengeluaran
    ValidateForm -->|Yes| SavePengeluaran[Save Pengeluaran ke Database]
    SavePengeluaran --> RefreshData[Refresh Data]
    RefreshData --> RecalculateStats[Recalculate Statistik]
    RecalculateStats --> DisplayStats
    
    SelectPengeluaran --> OpenEditDialog[Buka Dialog Edit]
    OpenEditDialog --> EditData[Edit Data Pengeluaran]
    EditData --> ValidateEdit{Form Valid?}
    ValidateEdit -->|No| ShowError
    ValidateEdit -->|Yes| UpdatePengeluaran[Update Pengeluaran]
    UpdatePengeluaran --> RefreshData
    
    ConfirmDelete -->|Yes| DeletePengeluaran[Delete Pengeluaran]
    ConfirmDelete -->|No| DisplayStats
    DeletePengeluaran --> RefreshData
```

---

## Format PlantUML - Semua Activity Diagram

File terpisah dengan format PlantUML lengkap dapat dibuat sesuai kebutuhan.

## Cara Menggunakan

### Mermaid Diagram
1. **GitHub/GitLab**: Copy-paste langsung ke README.md atau file markdown
2. **Notion**: Gunakan `/mermaid` block
3. **VS Code**: Install extension "Markdown Preview Mermaid Support"
4. **Online**: [Mermaid Live Editor](https://mermaid.live)

### PlantUML Diagram
1. **VS Code**: Install extension "PlantUML"
2. **Online**: [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
3. **Draw.io**: Import atau copy-paste code
4. **IntelliJ IDEA**: Built-in support

