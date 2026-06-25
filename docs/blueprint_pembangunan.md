# Blueprint Pembangunan Sistem ServisKu

Dokumen ini adalah "Buku Pintar" (Blueprint) yang menceritakan dari A-Z bagaimana sistem informasi ServisKu dibangun. Jika Anda di masa depan ingin membangun sistem yang mirip, Anda tidak perlu menebak-nebak lagi. Cukup ikuti kerangka kerja ini.

---

## 1. Product Requirement Document (PRD) Inti
Sebelum mulai menulis satu baris kode pun, kita menetapkan apa masalah yang ingin diselesaikan.

**Masalah:** Bengkel kesulitan melacak perangkat (mana yang sedang dikerjakan, mana yang menunggu *sparepart*), pembukuan kacau (omset dan laba campur aduk), dan repot mem-follow up pelanggan satu per satu.

**Solusi (Fitur Utama yang disepakati):**
1. **Sistem Antrean & Status Order (Kanban/Tabel)**: Memantau perangkat dari masuk sampai diambil.
2. **Manajemen Inventaris & HPP**: Bukan sekadar catat stok, tapi hitung Modal vs Harga Jual dengan metode *Weighted Average* (HPP) untuk mutasi masuk.
3. **CRM Sederhana**: Ada *database* pelanggan dan fitur "Klik untuk WhatsApp" template otomatis (menghemat waktu).
4. **Laporan & Analitik**: *Dashboard* metrik *live*, grafik omset vs laba, cetak struk (thermal 58mm/80mm), dan ekspor ke PDF/Excel.

---

## 2. Pilihan Teknologi (Tech Stack)
Pemilihan teknologi didasarkan pada kebutuhan *prototype* yang cepat, *modern*, dan bisa dijalankan tanpa harus pusing setup *database server* di awal.

*   **Frontend Framework**: React 18 dengan Vite (super cepat).
*   **Bahasa Pemrograman**: TypeScript (memastikan data konsisten, meminimalisir error logika sebelum dijalankan).
*   **Styling**: Tailwind CSS (untuk mendesain UI secara cepat dan *responsive*).
*   **State Management (Database Client-side)**: Zustand + `persist` middleware. 
    *   *Kenapa ini krusial?* Alih-alih membuat *backend* (Node.js/MySQL) untuk pengujian, kita menggunakan `localStorage` browser. Aplikasi berfungsi persis seperti memiliki database sungguhan, datanya tidak hilang saat di-refresh, dan sangat cocok untuk demo ke dosen/klien.
*   **Icons**: `lucide-react` (kumpulan ikon modern).
*   **Routing**: `react-router-dom` (navigasi antar halaman).
*   **Export Data**: `jspdf`, `jspdf-autotable`, `xlsx` (membuat dokumen profesional tanpa perlu backend).

---

## 3. Strategi UI/UX & Agent Skill "UI/UX Pro Max"
Pada tahap ini, kita menggunakan referensi visual premium agar aplikasi tidak terlihat kaku/murahan.
*   **Warna Utama**: *Deep Blue* (#1d4ed8) untuk tombol aksi utama (memberi kesan profesional dan terpercaya seperti bank atau software B2B modern). *Soft Gray/Slate* untuk background (`bg-[#f8fafc]`) agar mata tidak lelah.
*   **Bentuk (Shapes)**: *Rounded corners* (misal `rounded-2xl` atau `rounded-3xl` pada *card*). Ini adalah tren UI SaaS tahun 2024+.
*   **Micro-interactions**: Efek `hover` (tombol menyala atau membesar sedikit) dan transisi yang *smooth* (`transition-colors`).
*   **Struktur Layout**: Sidebar di kiri untuk menu (klasik B2B, mudah dinavigasi), header di atas untuk pencarian, profil, dan notifikasi. Konten utama ditaruh dalam kontainer dengan *padding* yang cukup (*breathing room*).

---

## 4. Rahasia Prompting AI (Cara Mengendalikan "Strict AI")
Membangun sistem kompleks seperti ini bersama AI membutuhkan strategi *prompting* yang tepat. Ini rahasianya:

### A. Jangan Minta Semuanya Sekaligus (Iterative Building)
*   **Salah**: "Buatkan saya aplikasi bengkel yang bisa stok, kasir, laporan PDF, login, dan notifikasi WA." (AI akan kebingungan dan menghasilkan kode berantakan).
*   **Benar (Langkah Kita)**:
    1.  *Langkah 1*: "Buat struktur dasar React + Tailwind dengan Sidebar dan Header."
    2.  *Langkah 2*: "Buat `store` Zustand untuk nyimpan data (Mock Data)."
    3.  *Langkah 3*: "Buat halaman Order Servis yang bisa tarik data dari Zustand."
    4.  *Langkah 4*: "Fungsikan tombol WhatsApp dan Cetak Struk."

### B. Pakai Referensi Visual (Visual Prompting)
Kita sering menggunakan skrinsut (gambar) saat Anda merevisi tampilan.
*   **Contoh**: Anda memberi skrinsut "Ini input angka ribuan susah dibaca, buatin pakai titik." AI langsung mengerti secara kontekstual di mana letak masalahnya tanpa harus Anda jelaskan di *file* mana kodenya berada.

### C. Paksa AI Menghitung Edge Cases (Kelemahan Logika)
Kita menginstruksikan AI untuk memikirkan "skenario terburuk".
*   **Contoh Mutasi Stok**: "Buat fitur masuk stok, tapi pastikan harga modal sebelumnya dan harga beli baru dicampur agar perhitungan Laba/Rugi kita valid." AI akhirnya mengimplementasikan *Weighted Average Cost*.

### D. Refactoring & Pembersihan
Seiring aplikasi membesar, kode menjadi kotor.
*   "Rapihkan kode ini seperti senior dev." Ini memaksa agen untuk merapikan *import*, menghapus variabel tak terpakai (seperti tag `<Input>` yang sisa tadi), dan menambahkan *JSDoc comments* (seperti yang baru saja saya lakukan di `store/index.ts`).

---

## Kesimpulan
Sistem ini kini kokoh sebagai *Minimum Viable Product* (MVP). Jika kelak Anda ingin mengubahnya menjadi aplikasi sungguhan (dengan *backend* cloud), Anda hanya perlu mengganti isi fungsi-fungsi di file `src/store/index.ts` (yang sebelumnya menggunakan `localStorage`) menjadi *fetch request* (Axios/REST API) ke *server backend* sungguhan. Sisa UI (React, Tailwind, Routing) **tidak perlu diubah sama sekali**.
