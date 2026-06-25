# Manual Penggunaan Aplikasi ServisKu

Dokumen ini adalah panduan lengkap cara menggunakan sistem informasi **ServisKu**, sebuah aplikasi *Point of Sales* (POS) dan Manajemen Bengkel Servis Perangkat Elektronik.

---

## 1. Modul Dashboard & Analitik
Halaman pertama setelah login. Berfungsi sebagai "Pusat Komando" untuk memantau performa bengkel hari ini.
- **Kartu Metrik**: Menampilkan ringkasan pendapatan hari ini, jumlah servis aktif, stok menipis, dan pelanggan baru.
- **Grafik Pendapatan**: Memvisualisasikan perbandingan pendapatan kotor (omset) vs laba bersih selama seminggu terakhir. Membantu melihat tren penjualan.
- **Antrean Servis (Live)**: Daftar perangkat yang sedang dikerjakan. Anda dapat mengubah status servis secara langsung melalui dropdown di sini.

## 2. Modul Kasir & Order Servis (Menu: Order)
Jantung dari aplikasi. Digunakan saat ada pelanggan yang datang membawa perangkat rusak.

### Membuat Order Baru
1. Klik tombol **"+ Order Baru"** di sudut kanan atas.
2. **Pilih Pelanggan**: Jika pelanggan lama, cari namanya. Jika baru, klik "Pelanggan Baru" dan masukkan nama serta No. WhatsApp.
3. **Detail Perangkat**: Masukkan jenis (HP/Laptop), merk/tipe, kelengkapan (seperti charger, kardus), dan keluhan utama.
4. **Perkiraan Biaya**: (Opsional) Masukkan estimasi awal jika pelanggan bertanya. Angka ini bisa diedit nanti.
5. Klik **"Simpan & Buat Order"**.

### Mengelola Detail Order (Halaman Order Detail)
Saat mengeklik sebuah nomor servis, Anda masuk ke halaman detail.
- **Update Status**: Ubah status pekerjaan (Antrean -> Proses -> Menunggu Part -> Siap Diambil -> Selesai).
- **Tambah Sparepart**: Jika butuh komponen, klik "Tambah Sparepart". Pilih dari stok. Total tagihan akan otomatis bertambah, dan stok sparepart akan otomatis dipotong.
- **Edit Biaya Jasa**: Klik ikon pensil di samping "Biaya Jasa Servis" untuk memasukkan biaya *fee* teknisi.
- **Hubungi Pelanggan (WhatsApp)**: Klik tombol "Hubungi Pelanggan" untuk otomatis membuka WhatsApp Web dengan pesan berisi *update* status dan total biaya.
- **Cetak Struk**: Klik "Cetak Struk" untuk mem-print nota/struk kasir thermal (mendukung 58mm atau 80mm).

## 3. Modul Manajemen Stok (Menu: Stok & Part)
Pusat kontrol inventaris barang.
- **Daftar Stok**: Menampilkan semua barang. Jika stok berada di bawah batas minimum (Min. Stok), akan muncul *badge* merah "Stok Menipis".
- **Tambah Sparepart Baru**: Digunakan untuk mendaftarkan SKU/barang jenis baru.
- **Mutasi Stok (IN/OUT)**: 
  - Gunakan mutasi **IN (Masuk)** saat restock/kulakan barang. Anda harus memasukkan Harga Beli. Sistem akan **otomatis menghitung HPP (Harga Pokok Penjualan) rata-rata** agar perhitungan laba Anda akurat.
  - Gunakan mutasi **OUT (Keluar)** jika barang hilang, rusak, atau dipakai untuk garansi.

## 4. Modul Pelanggan & Teknisi
- **Pelanggan**: Melihat daftar pelanggan, nomor WhatsApp, serta melihat siapa yang paling sering servis (Total Servis).
- **Teknisi (Menu: Pengaturan)**: (Terletak di Pengaturan untuk saat ini) Anda dapat memantau performa teknisi, melihat berapa pekerjaan yang diselesaikan bulan ini, dan rating kepuasan mereka.

## 5. Laporan & Ekspor (Menu: Laporan)
Modul untuk rekapitulasi performa bulanan bengkel.
- **Pilih Bulan**: Terdapat *dropdown* untuk melihat rekap bulan tertentu.
- **Ringkasan**: Menampilkan Total Omset, HPP (Modal), dan Keuntungan Bersih riil.
- **Riwayat Transaksi**: Menampilkan seluruh nota yang berstatus "SELESAI".
- **Sparepart Terlaris**: Ranking komponen yang paling laku bulan tersebut.
- **Performa Teknisi**: Ranking teknisi berdasarkan jumlah pekerjaan terbanyak.
- **Export**: Anda dapat mengekspor laporan ke format **PDF** (untuk presentasi/cetak rapi) atau **Excel (.xlsx)** (jika ingin diolah/dijumlah manual lebih lanjut di Spreadsheet).

## 6. Pengaturan (Menu: Pengaturan)
Akses melalui *sidebar* atau dengan mengeklik profil di kanan atas.
- Ubah **Nama Toko** dan **Nama Pemilik**.
- Ubah **Alamat** dan **Kontak** (akan muncul di struk cetak).
- Atur **Ukuran Printer** (58mm / 80mm) untuk kasir.
- (Tersedia opsi *toggle* untuk Integrasi WA dan Notifikasi UI).
