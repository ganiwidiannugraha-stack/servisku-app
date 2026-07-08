# ServisKu - Sistem Manajemen Servis & Inventaris

ServisKu adalah aplikasi manajemen perbaikan perangkat elektronik terpadu yang dirancang untuk toko servis / bengkel. Aplikasi ini mengintegrasikan pencatatan *Customer Relationship Management* (CRM), manajemen inventaris (stok barang), rekam jejak teknisi, laporan keuangan otomatis, dan pengiriman notifikasi WhatsApp Gateway.

## 🚀 Fitur Utama

- **Dashboard Analitik Dinamis**: Memantau grafik pendapatan bulanan, pesanan yang sedang aktif, dan performa keuangan menggunakan `Recharts`.
- **Manajemen Pesanan (Work Order)**: Siklus *Finite State Machine* dari perangkat Masuk, Diagnosa, Proses, Menunggu Sparepart, hingga Selesai/Batal.
- **Role-Based Access Control (RBAC)**: Pembatasan rute dan aksi berdasarkan peran pengguna (`OWNER`, `ADMIN`, `TEKNISI`, `FINANCE`, `INVENTORY`, `FRONTLINE`). Catatan: Peran `OWNER` adalah eksklusif (root) dan tidak dapat diduplikasi melalui antarmuka aplikasi demi keamanan.
- **Inventory & Stock Ledger**: Manajemen stok *sparepart*, riwayat masuk/keluar mutasi stok (FIFO/Average HPP logic), dan notifikasi stok menipis.
- **Sistem Laporan Komprehensif**: Cetak otomatis nota termal (58mm/80mm), ekspor laporan keuangan dan operasional ke PDF (`jspdf`) & Excel (`xlsx`).
- **Data Persistance**: Local-first state synchronization dengan `Zustand` & sinkronisasi transaksional ke database `Supabase`.

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Vite)
- **Styling**: [Tailwind CSS v3.4](https://tailwindcss.com/) dengan arsitektur UI *Glassmorphism* dan *Framer Motion* untuk animasi.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (`src/store/index.ts`) menggunakan *persist middleware*.
- **Database & Backend**: [Supabase](https://supabase.com/) (PostgreSQL + PostgREST).
- **Routing**: `react-router-dom` v7.
- **Form & Validation**: `react-hook-form` + `zod`.
- **Icons**: `lucide-react`.

## 📂 Struktur Direktori (Architecture)

```text
servisku-app/
├── public/                 # Aset statis (Logo, favicon)
├── scripts/
│   └── seedRealData.mjs    # Script seeder data Supabase untuk testing/dev
├── src/
│   ├── components/         # Reusable UI Components
│   │   ├── layout/         # Shell aplikasi (Header, Sidebar, PageWrapper)
│   │   └── ui/             # Komponen atomik (Button, Modal, StatusBadge, SkeletonLoader)
│   ├── lib/                # Konfigurasi library pihak ketiga (Supabase Client)
│   ├── pages/              # Komponen View Level (Routing targets)
│   ├── services/           # Abstraksi Backend API (Interaksi Data Supabase)
│   ├── store/              # Global State (Zustand) & Business Logic Interfaces
│   ├── utils/              # Fungsi helper murni (Cetak PDF, Format Rupiah, WA link)
│   ├── App.tsx             # Entry point router & Auth Boundary
│   └── main.tsx            # React root injection
├── supabase_schema.sql     # Skema database DDL untuk initial setup (BACA INI SEBELUM DEPLOY)
└── package.json
```

## 🔒 Skema Database & Setup Supabase (Penting!)

Aplikasi ini sangat bergantung pada struktur relasional di PostgreSQL (Supabase). Semua kode SQL yang diperlukan untuk membangun tabel, relasi (Foreign Keys), Index, dan RLS (Row Level Security) telah disediakan dalam file **`supabase_schema.sql`** di root folder.

### Cara Inisialisasi:
1. Buat proyek baru di [Supabase](https://supabase.com/).
2. Masuk ke menu **SQL Editor**.
3. *Copy* seluruh isi dari file `supabase_schema.sql`.
4. *Paste* dan klik **Run**.
5. Dapatkan `Project URL` dan `anon/public API Key` dari menu **Project Settings > API**.

## 💻 Environment Variables

Buat file `.env` di root direktori proyek Anda:

```env
VITE_SUPABASE_URL=https://<PROJECT_ID>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJh...<ANON_KEY>
```

> **Catatan Keamanan:** Jangan pernah menaruh `.env` ke *Version Control* (GitHub). File ini sudah dimasukkan ke `.gitignore`.

## 🚦 Panduan Setup untuk Kolaborator (Developer)

Ikuti langkah-langkah berikut agar aplikasi bisa berjalan sempurna di komputermu dengan database Supabase yang asli.

### 1. Tarik (Pull) Kode Terbaru
Pastikan kamu memiliki versi terbaru dari repository ini:
```bash
git pull origin main
```

### 2. Install Dependensi Baru
Terdapat tambahan library untuk fitur PDF, Excel, dan Grafik. Wajib menjalankan:
```bash
npm install
```

### 3. Setup Database Supabase
Kamu tidak perlu merancang tabel secara manual.
1. Buka dashboard proyek **Supabase** kalian.
2. Masuk ke menu **SQL Editor**.
3. Buka file **`supabase_schema.sql`** yang ada di repository ini.
4. *Copy* seluruh isinya, *paste* ke SQL Editor Supabase, lalu klik **Run**.

### 4. Hubungkan Aplikasi ke Database (Variabel Lingkungan)
Aplikasi butuh akses ke Supabase untuk membaca dan menulis data.
1. Buat file baru bernama **`.env`** di root folder (sejajar dengan `package.json`).
2. Isi dengan URL dan API Key proyek Supabase kalian:
```env
VITE_SUPABASE_URL=https://<ID_PROJECT>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJh...<API_KEY_ANON>
```
*(Catatan: Ambil URL dan Key ini dari dashboard Supabase: Project Settings > API).*

### 5. Jalankan Aplikasi
Setelah semuanya siap, jalankan server pengembangan lokal:
```bash
npm run dev
```

## 👥 Sistem Akun (Role-Based Demo)

Untuk memudahkan *development* dan *testing*, gunakan kredensial bawaan berikut:
- **Owner**: `owner` / `owner` (Akses Penuh)
- **Frontline/Kasir**: `frontline` / `frontline` (Akses Order & Pelanggan)
- **Teknisi**: `teknisi` / `teknisi` (Akses Order & Stok)
- **Admin Gudang**: `inventory` / `inventory` (Akses Stok)
- **Keuangan**: `finance` / `finance` (Akses Laporan)

## 🏗️ Pola Desain (Design Patterns) Terapan

1. **Service Layer Pattern**: Semua pemanggilan eksternal (Supabase API) diabstraksi di dalam `src/services/backendServices.ts`. Komponen React tidak pernah memanggil Supabase secara langsung, melainkan melalui *Store* (Zustand).
2. **Optimistic UI Updates**: Beberapa aksi (seperti pengubahan status) memperbarui antarmuka terlebih dahulu via *Store* sebelum database mengonfirmasi, memberikan ilusi responsif 0ms kepada pengguna.
3. **Controlled Modals**: Sistem *overlay* dan *modal* dipusatkan pada komponen `Modal.tsx` yang menangani trap *focus* keyboard dan animasi klik luar (backdrop).

## 📄 Standar Dokumentasi Kode (JSDoc)
Semua fungsi publik, antarmuka (Interface), dan *Store Actions* didokumentasikan menggunakan format standar JSDoc/TSDoc. Ini memudahkan *IntelliSense* IDE modern (seperti VS Code) untuk memunculkan konteks variabel secara *real-time*.

---
*Dibangun dengan ❤️ untuk efisiensi bisnis reparasi modern.*
