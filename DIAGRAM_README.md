# 📊 Diagram Dokumentasi - Laundry Management System

Dokumentasi diagram Use Case dan Activity Diagram untuk aplikasi Laundry Management System.

## 📁 File yang Tersedia

### Use Case Diagram
- **`diagram_use_case.md`** - Use Case Diagram dalam format Mermaid dan PlantUML
- **`diagrams/use_case_diagram.puml`** - Use Case Diagram format PlantUML

### Activity Diagram
- **`diagram_activity.md`** - Semua Activity Diagram dalam format Mermaid dan PlantUML
- **`diagrams/activity_buat_transaksi.puml`** - Activity Diagram: Buat Transaksi
- **`diagrams/activity_update_status.puml`** - Activity Diagram: Update Status Transaksi
- **`diagrams/activity_cek_status.puml`** - Activity Diagram: Cek Status (Pelanggan)
- **`diagrams/activity_login_register.puml`** - Activity Diagram: Login & Register

## 🎯 Use Case yang Tersedia

### 1. Authentication
- Register
- Login
- Logout

### 2. Manajemen Layanan
- View, Create, Update, Delete Layanan

### 3. Manajemen Pelanggan
- View, Create, Update, Delete, Search Pelanggan

### 4. Manajemen Transaksi
- View, Create, Update Status, Update Pembayaran
- Generate Struk & QR Code
- Kirim Struk via WhatsApp
- Search Transaksi

### 5. Keuangan
- View Laporan Keuangan
- Manajemen Pengeluaran
- View Statistik

### 6. Public Features
- Cek Status Transaksi (tanpa login)
- View QR Code

## 🔧 Cara Menggunakan Diagram

### Mermaid Diagram (diagram_use_case.md & diagram_activity.md)

#### 1. GitHub/GitLab
- Copy-paste langsung ke file markdown (.md)
- GitHub/GitLab akan otomatis render diagram

#### 2. Notion
- Gunakan block `/mermaid`
- Paste code mermaid ke dalam block

#### 3. VS Code
- Install extension: **"Markdown Preview Mermaid Support"**
- Buka preview mode untuk melihat diagram

#### 4. Online Editor
- Buka [Mermaid Live Editor](https://mermaid.live)
- Copy-paste code mermaid
- Export sebagai PNG/SVG

### PlantUML Diagram (diagrams/*.puml)

#### 1. VS Code
- Install extension: **"PlantUML"**
- Buka file `.puml`
- Klik kanan → "Preview Current Diagram"
- Export sebagai PNG/SVG

#### 2. IntelliJ IDEA / PyCharm
- Built-in PlantUML support
- Buka file `.puml`
- Klik preview icon
- Export sebagai PNG/SVG

#### 3. Online Editor
- Buka [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
- Copy-paste code dari file `.puml`
- Klik "Submit" untuk melihat diagram
- Export sebagai PNG/SVG

#### 4. Draw.io
- Buka [Draw.io](https://app.diagrams.net/)
- File → Import → From Text
- Paste code PlantUML
- Atau gunakan: Arrange → Insert → Advanced → PlantUML

#### 5. Command Line (Java required)
```bash
# Install PlantUML jar
# Download dari: http://plantuml.com/download

# Generate PNG
java -jar plantuml.jar diagrams/*.puml

# Generate SVG
java -jar plantuml.jar -tsvg diagrams/*.puml
```

## 📋 Daftar Activity Diagram

1. **Buat Transaksi** - Alur lengkap membuat transaksi baru
2. **Update Status Transaksi** - Alur update status (antrian → proses → selesai)
3. **Update Status Pembayaran** - Alur update status pembayaran
4. **Cek Status (Pelanggan)** - Alur pelanggan mengecek status tanpa login
5. **Login & Register** - Alur autentikasi user
6. **Manajemen Pengeluaran** - Alur CRUD pengeluaran usaha

## 🎨 Tips Visualisasi

### Mermaid
- **Lebih baik untuk**: Flowchart sederhana, use case diagram
- **Kelebihan**: Mudah digunakan, support di banyak platform
- **Format**: Dapat langsung di-embed di markdown

### PlantUML
- **Lebih baik untuk**: Activity diagram kompleks, sequence diagram
- **Kelebihan**: Lebih powerful, lebih banyak opsi styling
- **Format**: Perlu tool khusus untuk render

## 📝 Catatan

- Semua diagram sudah disesuaikan dengan implementasi aktual aplikasi
- Activity Diagram mencakup validasi, error handling, dan real-time update
- Diagram dapat di-customize sesuai kebutuhan dokumentasi

## 🔄 Update Diagram

Jika ada perubahan fitur di aplikasi, update diagram yang relevan:
1. Edit file markdown atau `.puml`
2. Test render di tool yang digunakan
3. Export sebagai gambar jika diperlukan untuk dokumentasi final

