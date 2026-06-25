import type { Customer, Sparepart, Order, MutasiStok, Technician, Settings } from './index';

export const MOCK_TECHNICIANS: Technician[] = [
  { id: 't1', name: 'Deni Setiawan', avatar: 'D', rating: 4.9, jobs: 52, active: true },
  { id: 't2', name: 'Rina Amelia', avatar: 'R', rating: 4.7, jobs: 48, active: true },
  { id: 't3', name: 'Hendra Kusuma', avatar: 'H', rating: 4.8, jobs: 48, active: true },
];

export const DEFAULT_SETTINGS: Settings = {
  shopName: 'ServisKu Repair',
  ownerName: 'Pak Teten',
  address: 'Jl. Teknologi No. 123, Jakarta',
  phone: '081234567890',
  printerWidth: '58mm',
  enableWA: true,
  enableNotifications: true
};

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', nama: 'Budi Santoso', noHp: '081234567890', alamat: 'Jl. Merdeka No 5', totalServis: 3, terakhirServis: '2026-06-15' },
  { id: 'c2', nama: 'Siti Aminah', noHp: '085678901234', alamat: 'Jl. Sudirman No 10', totalServis: 1, terakhirServis: '2026-06-10' },
  { id: 'c3', nama: 'Agus Pratama', noHp: '081122334455', alamat: 'Jl. Mangga Dua No 3', totalServis: 2, terakhirServis: '2026-05-20' },
  { id: 'c4', nama: 'Linda Wijaya', noHp: '081299887766', alamat: 'Jl. Kebon Jeruk 12', totalServis: 1, terakhirServis: '2026-06-20' },
  { id: 'c5', nama: 'Rudi Hartono', noHp: '085712345678', alamat: 'Komp. Harmoni Blok B/2', totalServis: 5, terakhirServis: '2026-06-22' },
  { id: 'c6', nama: 'Maya Sari', noHp: '081344556677', alamat: 'Jl. Pahlawan 45', totalServis: 1, terakhirServis: '2026-06-18' },
  { id: 'c7', nama: 'Dicky Firman', noHp: '081255667788', alamat: 'Jl. Cempaka Putih 7', totalServis: 2, terakhirServis: '2026-06-19' },
  { id: 'c8', nama: 'Siska Novita', noHp: '087811223344', alamat: 'Apt. Sudirman Park', totalServis: 1, terakhirServis: '2026-06-23' },
  { id: 'c9', nama: 'Tono Subagyo', noHp: '089622334455', alamat: 'Jl. Kemang Raya 8', totalServis: 4, terakhirServis: '2026-06-21' },
  { id: 'c10', nama: 'Ani Lestari', noHp: '081199887766', alamat: 'Perum Pondok Indah', totalServis: 2, terakhirServis: '2026-06-24' },
  { id: 'c11', nama: 'Wawan Gunawan', noHp: '081233445566', alamat: 'Jl. Gajah Mada 100', totalServis: 1, terakhirServis: '2026-06-12' },
  { id: 'c12', nama: 'Rini Andriyani', noHp: '085699887766', alamat: 'Jl. Pemuda 22', totalServis: 3, terakhirServis: '2026-06-14' },
  { id: 'c13', nama: 'Fajar Hidayat', noHp: '081377889900', alamat: 'Komp. Polri Blok C/5', totalServis: 1, terakhirServis: '2026-06-25' },
  { id: 'c14', nama: 'Nia Ramadhani', noHp: '087855667788', alamat: 'Jl. Melawai 9', totalServis: 2, terakhirServis: '2026-06-01' },
  { id: 'c15', nama: 'Arif Setiawan', noHp: '089511223344', alamat: 'Jl. Diponegoro 15', totalServis: 1, terakhirServis: '2026-06-05' },
];

export const MOCK_SPAREPARTS: Sparepart[] = [
  { id: 's1', nama: 'RAM DDR4 8GB 3200MHz', kategori: 'RAM', stok: 12, minStok: 5, hargaModal: 350000, harga: 450000, pajak: 11 },
  { id: 's2', nama: 'RAM DDR4 4GB 2666MHz', kategori: 'RAM', stok: 3, minStok: 5, hargaModal: 180000, harga: 250000, pajak: 11 },
  { id: 's3', nama: 'SSD SATA 256GB', kategori: 'HDD/SSD', stok: 8, minStok: 5, hargaModal: 220000, harga: 320000, pajak: 11 },
  { id: 's4', nama: 'SSD NVMe 512GB', kategori: 'HDD/SSD', stok: 15, minStok: 5, hargaModal: 450000, harga: 600000, pajak: 11 },
  { id: 's5', nama: 'HDD 1TB Seagate', kategori: 'HDD/SSD', stok: 4, minStok: 3, hargaModal: 550000, harga: 700000, pajak: 11 },
  { id: 's6', nama: 'Keyboard Laptop Asus X441', kategori: 'Keyboard', stok: 2, minStok: 2, hargaModal: 80000, harga: 150000, pajak: 11 },
  { id: 's7', nama: 'Keyboard Laptop Lenovo IdeaPad', kategori: 'Keyboard', stok: 5, minStok: 2, hargaModal: 90000, harga: 175000, pajak: 11 },
  { id: 's8', nama: 'Baterai Asus X453', kategori: 'Baterai', stok: 1, minStok: 2, hargaModal: 180000, harga: 300000, pajak: 11 },
  { id: 's9', nama: 'Baterai Acer Aspire', kategori: 'Baterai', stok: 4, minStok: 2, hargaModal: 190000, harga: 320000, pajak: 11 },
  { id: 's10', nama: 'Thermal Paste GD900', kategori: 'Lainnya', stok: 20, minStok: 10, hargaModal: 15000, harga: 35000, pajak: 11 },
  { id: 's11', nama: 'Thermal Paste Grizzly', kategori: 'Lainnya', stok: 8, minStok: 5, hargaModal: 120000, harga: 180000, pajak: 11 },
  { id: 's12', nama: 'LCD LED 14.0 Slim 30 Pin', kategori: 'Layar', stok: 3, minStok: 2, hargaModal: 550000, harga: 750000, pajak: 11 },
  { id: 's13', nama: 'Tinta Epson 003 Hitam', kategori: 'Tinta', stok: 15, minStok: 5, hargaModal: 75000, harga: 110000, pajak: 11 },
  { id: 's14', nama: 'PSU 500W 80+ Bronze', kategori: 'PSU', stok: 5, minStok: 2, hargaModal: 450000, harga: 650000, pajak: 11 },
  { id: 's15', nama: 'Motherboard H410M', kategori: 'Motherboard', stok: 2, minStok: 2, hargaModal: 800000, harga: 1100000, pajak: 11 },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1', noServis: 'SRV-20260625-001', pelangganId: 'c1', jenisPerangkat: 'Laptop', merkModel: 'Asus ROG Strix',
    keluhan: 'Panas saat main game, minta repaste dan bersihkan debu', estimasiBiaya: 150000, biayaJasa: 115000,
    status: 'SELESAI', tanggalMasuk: '2026-06-25T08:00:00Z', teknisiId: 't1',
    spareparts: [{ id: 's10', qty: 1 }], pemeriksaanAwal: 'Suhu idle 60C, full load 95C',
    hasilDiagnosa: 'Debu tebal di fan, thermal paste kering', estimasiSelesai: '2026-06-25T14:00:00Z'
  },
  {
    id: 'o2', noServis: 'SRV-20260625-002', pelangganId: 'c2', jenisPerangkat: 'PC', merkModel: 'Rakit PC Kantor',
    keluhan: 'Lambat banget saat buka excel', estimasiBiaya: 400000, biayaJasa: 80000,
    status: 'DIAMBIL', tanggalMasuk: '2026-06-24T09:30:00Z', teknisiId: 't2',
    spareparts: [{ id: 's3', qty: 1 }], pemeriksaanAwal: 'Masih pakai HDD 500GB 100% disk usage',
    hasilDiagnosa: 'Perlu upgrade SSD', estimasiSelesai: '2026-06-24T16:00:00Z'
  },
  {
    id: 'o3', noServis: 'SRV-20260625-003', pelangganId: 'c3', jenisPerangkat: 'Laptop', merkModel: 'Lenovo IdeaPad 3',
    keluhan: 'Keyboard ada 4 tombol tidak fungsi (W,A,S,D)', estimasiBiaya: 250000, biayaJasa: 75000,
    status: 'MENUNGGU_SPAREPART', tanggalMasuk: '2026-06-25T10:15:00Z', teknisiId: 't3',
    spareparts: [{ id: 's7', qty: 1 }], pemeriksaanAwal: 'Test keyboard memang rusak jalur W,A,S,D',
    hasilDiagnosa: 'Ganti keyboard fullset'
  },
  {
    id: 'o4', noServis: 'SRV-20260625-004', pelangganId: 'c4', jenisPerangkat: 'Printer', merkModel: 'Epson L3110',
    keluhan: 'Tinta hitam tidak keluar', estimasiBiaya: 200000, biayaJasa: 90000,
    status: 'PROSES', tanggalMasuk: '2026-06-25T11:00:00Z', teknisiId: 't1',
    spareparts: [{ id: 's13', qty: 1 }], pemeriksaanAwal: 'Head kering karena jarang dipakai',
    hasilDiagnosa: 'Head cleaning & flushing, isi ulang tinta', estimasiSelesai: '2026-06-26T12:00:00Z'
  },
  {
    id: 'o5', noServis: 'SRV-20260625-005', pelangganId: 'c5', jenisPerangkat: 'Laptop', merkModel: 'Acer Nitro 5',
    keluhan: 'Mati total saat dicolok listrik semalaman', estimasiBiaya: 800000,
    status: 'MENUNGGU_KONFIRMASI', tanggalMasuk: '2026-06-23T14:20:00Z', teknisiId: 't2',
    spareparts: [], pemeriksaanAwal: 'Tidak ada tanda kehidupan, indikator mati',
    hasilDiagnosa: 'IC Power short sirkuit'
  },
  {
    id: 'o6', noServis: 'SRV-20260625-006', pelangganId: 'c6', jenisPerangkat: 'PC', merkModel: 'Gaming PC Rakitan',
    keluhan: 'Sering restart sendiri saat main game berat', estimasiBiaya: 750000, biayaJasa: 100000,
    status: 'SIAP_DIAMBIL', tanggalMasuk: '2026-06-22T09:00:00Z', teknisiId: 't3',
    spareparts: [{ id: 's14', qty: 1 }], pemeriksaanAwal: 'Stress test mati di 10 menit',
    hasilDiagnosa: 'PSU drop tegangannya, perlu ganti', estimasiSelesai: '2026-06-23T15:00:00Z'
  },
  {
    id: 'o7', noServis: 'SRV-20260625-007', pelangganId: 'c7', jenisPerangkat: 'Laptop', merkModel: 'Asus VivoBook',
    keluhan: 'Layar bergaris-garis lalu putih', estimasiBiaya: 850000, biayaJasa: 100000,
    status: 'DIAMBIL', tanggalMasuk: '2026-06-20T10:00:00Z', teknisiId: 't1',
    spareparts: [{ id: 's12', qty: 1 }], pemeriksaanAwal: 'Tes via HDMI ke monitor luar aman',
    hasilDiagnosa: 'Layar internal rusak, wajib ganti panel LCD'
  },
  {
    id: 'o8', noServis: 'SRV-20260625-008', pelangganId: 'c8', jenisPerangkat: 'Laptop', merkModel: 'MacBook Air M1',
    keluhan: 'Kemasukan air kopi sedikit', estimasiBiaya: 500000,
    status: 'BATAL', tanggalMasuk: '2026-06-24T13:00:00Z', teknisiId: 't2',
    spareparts: [], pemeriksaanAwal: 'Mesin korosi di area logic board',
    hasilDiagnosa: 'Perbaikan logic board rumit, user batal servis kemahalan'
  },
  {
    id: 'o9', noServis: 'SRV-20260625-009', pelangganId: 'c9', jenisPerangkat: 'PC', merkModel: 'PC Kasir',
    keluhan: 'Nyala tapi no display', estimasiBiaya: 350000, biayaJasa: 100000,
    status: 'PROSES', tanggalMasuk: '2026-06-25T08:30:00Z', teknisiId: 't3',
    spareparts: [{ id: 's2', qty: 1 }], pemeriksaanAwal: 'Beep code memory error',
    hasilDiagnosa: 'RAM DDR4 4GB mati, perlu ganti baru', estimasiSelesai: '2026-06-25T17:00:00Z'
  },
  {
    id: 'o10', noServis: 'SRV-20260625-010', pelangganId: 'c10', jenisPerangkat: 'Laptop', merkModel: 'HP Pavilion 14',
    keluhan: 'Baterai cepat habis dan agak bengkak (touchpad naik)', estimasiBiaya: 400000, biayaJasa: 80000,
    status: 'MASUK', tanggalMasuk: '2026-06-25T13:00:00Z', teknisiId: 't1',
    spareparts: [], pemeriksaanAwal: 'Visual baterai kembung parah'
  },
  {
    id: 'o11', noServis: 'SRV-20260625-011', pelangganId: 'c11', jenisPerangkat: 'Laptop', merkModel: 'Acer Aspire 3',
    keluhan: 'Baterai sudah drop banget, harus colok terus', estimasiBiaya: 400000, biayaJasa: 80000,
    status: 'SELESAI', tanggalMasuk: '2026-06-24T14:00:00Z', teknisiId: 't2',
    spareparts: [{ id: 's9', qty: 1 }], pemeriksaanAwal: 'Baterai health tinggal 10%',
    hasilDiagnosa: 'Ganti baterai OEM', estimasiSelesai: '2026-06-25T11:00:00Z'
  },
  {
    id: 'o12', noServis: 'SRV-20260625-012', pelangganId: 'c12', jenisPerangkat: 'PC', merkModel: 'PC Admin',
    keluhan: 'Sering blue screen error 0x00000024', estimasiBiaya: 800000, biayaJasa: 100000,
    status: 'SIAP_DIAMBIL', tanggalMasuk: '2026-06-23T09:00:00Z', teknisiId: 't3',
    spareparts: [{ id: 's5', qty: 1 }], pemeriksaanAwal: 'Ccek HDD banyak bad sector',
    hasilDiagnosa: 'HDD rusak parah, ganti HDD 1TB baru + clone OS', estimasiSelesai: '2026-06-24T10:00:00Z'
  },
  {
    id: 'o13', noServis: 'SRV-20260625-013', pelangganId: 'c13', jenisPerangkat: 'Laptop', merkModel: 'MSI GF63',
    keluhan: 'Minta upgrade storage tambah NVMe', estimasiBiaya: 700000, biayaJasa: 100000,
    status: 'DIAMBIL', tanggalMasuk: '2026-06-21T15:00:00Z', teknisiId: 't1',
    spareparts: [{ id: 's4', qty: 1 }], pemeriksaanAwal: 'Slot M.2 kosong dan support NVMe',
    hasilDiagnosa: 'Pasang SSD NVMe 512GB + Install ulang Windows'
  },
  {
    id: 'o14', noServis: 'SRV-20260625-014', pelangganId: 'c14', jenisPerangkat: 'Printer', merkModel: 'Canon G2010',
    keluhan: 'Paper jam, kertas nyangkut terus', estimasiBiaya: 150000,
    status: 'DIAGNOSA', tanggalMasuk: '2026-06-25T14:30:00Z', teknisiId: 't2',
    spareparts: [], pemeriksaanAwal: 'Ada bunyi krek-krek di roller narik kertas'
  },
  {
    id: 'o15', noServis: 'SRV-20260625-015', pelangganId: 'c15', jenisPerangkat: 'Laptop', merkModel: 'Lenovo ThinkPad T480',
    keluhan: 'Upgrade RAM ke 16GB', estimasiBiaya: 500000, biayaJasa: 50000,
    status: 'SELESAI', tanggalMasuk: '2026-06-25T10:00:00Z', teknisiId: 't3',
    spareparts: [{ id: 's1', qty: 1 }], pemeriksaanAwal: 'RAM bawaan 8GB single channel',
    hasilDiagnosa: 'Tambah RAM DDR4 8GB jadi 16GB Dual Channel', estimasiSelesai: '2026-06-25T12:00:00Z'
  },
  {
    id: 'o16', noServis: 'SRV-20260625-016', pelangganId: 'c5', jenisPerangkat: 'PC', merkModel: 'Motherboard error',
    keluhan: 'Tiba-tiba mati dan bau hangus', estimasiBiaya: 1200000, biayaJasa: 100000,
    status: 'PROSES', tanggalMasuk: '2026-06-25T08:00:00Z', teknisiId: 't1',
    spareparts: [{ id: 's15', qty: 1 }], pemeriksaanAwal: 'Mobo lama konslet, VRM gosong',
    hasilDiagnosa: 'Ganti mobo H410M baru'
  },
  {
    id: 'o17', noServis: 'SRV-20260625-017', pelangganId: 'c9', jenisPerangkat: 'Laptop', merkModel: 'Asus X441',
    keluhan: 'Keyboard error dan lelet banget', estimasiBiaya: 520000, biayaJasa: 100000,
    status: 'SIAP_DIAMBIL', tanggalMasuk: '2026-06-23T11:00:00Z', teknisiId: 't2',
    spareparts: [{ id: 's6', qty: 1 }, { id: 's3', qty: 1 }], pemeriksaanAwal: 'Keyboard rusak dan masih pakai HDD lama',
    hasilDiagnosa: 'Ganti keyboard dan upgrade ke SSD 256GB'
  },
  {
    id: 'o18', noServis: 'SRV-20260625-018', pelangganId: 'c1', jenisPerangkat: 'PC', merkModel: 'PC Desain',
    keluhan: 'Minta dirakit ulang, pindah casing', estimasiBiaya: 250000,
    status: 'MENUNGGU_KONFIRMASI', tanggalMasuk: '2026-06-25T16:00:00Z', teknisiId: 't3',
    spareparts: [], pemeriksaanAwal: 'Casing lama kotor dan sirkulasi jelek',
    hasilDiagnosa: 'Jasa pindah casing dan cable management'
  },
  {
    id: 'o19', noServis: 'SRV-20260625-019', pelangganId: 'c2', jenisPerangkat: 'Laptop', merkModel: 'MacBook Pro 2019',
    keluhan: 'Layar flexgate', estimasiBiaya: 0,
    status: 'BATAL_SIAP_DIAMBIL', tanggalMasuk: '2026-06-21T10:00:00Z', teknisiId: 't1',
    spareparts: [], pemeriksaanAwal: 'Layar dibuka lebar mati',
    hasilDiagnosa: 'Kabel flexibel LCD putus, biaya perbaikan mahal, user batal'
  },
  {
    id: 'o20', noServis: 'SRV-20260625-020', pelangganId: 'c12', jenisPerangkat: 'Laptop', merkModel: 'Acer Swift 3',
    keluhan: 'Kipas bunyi ngorok kasar', estimasiBiaya: 200000, biayaJasa: 50000,
    status: 'PROSES', tanggalMasuk: '2026-06-25T15:00:00Z', teknisiId: 't2',
    spareparts: [{ id: 's11', qty: 1 }], pemeriksaanAwal: 'Bearing fan aus kotor',
    hasilDiagnosa: 'Bersihkan fan, pelumasan bearing, dan ganti thermal paste grizzly'
  }
];

export const MOCK_MUTASISTOK: MutasiStok[] = [
  // Initial Restock (IN)
  { id: 'm1', sparepartId: 's1', tipe: 'IN', qty: 13, hargaBeli: 350000, tanggal: '2026-06-01T09:00:00Z', keterangan: 'Restock awal bulan' },
  { id: 'm2', sparepartId: 's2', tipe: 'IN', qty: 4, hargaBeli: 180000, tanggal: '2026-06-01T09:05:00Z', keterangan: 'Restock awal bulan' },
  { id: 'm3', sparepartId: 's3', tipe: 'IN', qty: 10, hargaBeli: 220000, tanggal: '2026-06-01T09:10:00Z', keterangan: 'Restock awal bulan' },
  { id: 'm4', sparepartId: 's4', tipe: 'IN', qty: 16, hargaBeli: 450000, tanggal: '2026-06-01T09:15:00Z', keterangan: 'Restock awal bulan' },
  { id: 'm5', sparepartId: 's5', tipe: 'IN', qty: 5, hargaBeli: 550000, tanggal: '2026-06-01T09:20:00Z', keterangan: 'Restock awal bulan' },
  { id: 'm6', sparepartId: 's6', tipe: 'IN', qty: 3, hargaBeli: 80000, tanggal: '2026-06-01T09:25:00Z', keterangan: 'Restock awal bulan' },
  { id: 'm7', sparepartId: 's7', tipe: 'IN', qty: 6, hargaBeli: 90000, tanggal: '2026-06-01T09:30:00Z', keterangan: 'Restock awal bulan' },
  { id: 'm8', sparepartId: 's10', tipe: 'IN', qty: 21, hargaBeli: 15000, tanggal: '2026-06-01T09:35:00Z', keterangan: 'Restock thermal paste' },
  { id: 'm9', sparepartId: 's11', tipe: 'IN', qty: 9, hargaBeli: 120000, tanggal: '2026-06-01T09:40:00Z', keterangan: 'Restock thermal paste premium' },
  { id: 'm10', sparepartId: 's12', tipe: 'IN', qty: 4, hargaBeli: 550000, tanggal: '2026-06-01T09:45:00Z', keterangan: 'Restock panel LED' },
  { id: 'm11', sparepartId: 's13', tipe: 'IN', qty: 16, hargaBeli: 75000, tanggal: '2026-06-01T09:50:00Z', keterangan: 'Restock tinta Epson' },
  { id: 'm12', sparepartId: 's14', tipe: 'IN', qty: 6, hargaBeli: 450000, tanggal: '2026-06-01T09:55:00Z', keterangan: 'Restock PSU' },
  { id: 'm13', sparepartId: 's15', tipe: 'IN', qty: 3, hargaBeli: 800000, tanggal: '2026-06-01T10:00:00Z', keterangan: 'Restock Mobo H410' },

  // Used in Service Orders (OUT)
  { id: 'm20', sparepartId: 's4', tipe: 'OUT', qty: 1, tanggal: '2026-06-21T16:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-013' },
  { id: 'm21', sparepartId: 's14', tipe: 'OUT', qty: 1, tanggal: '2026-06-22T14:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-006' },
  { id: 'm22', sparepartId: 's12', tipe: 'OUT', qty: 1, tanggal: '2026-06-22T10:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-007' },
  { id: 'm23', sparepartId: 's5', tipe: 'OUT', qty: 1, tanggal: '2026-06-23T11:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-012' },
  { id: 'm24', sparepartId: 's6', tipe: 'OUT', qty: 1, tanggal: '2026-06-23T14:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-017' },
  { id: 'm25', sparepartId: 's3', tipe: 'OUT', qty: 1, tanggal: '2026-06-23T14:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-017' },
  { id: 'm26', sparepartId: 's3', tipe: 'OUT', qty: 1, tanggal: '2026-06-24T12:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-002' },
  { id: 'm27', sparepartId: 's9', tipe: 'OUT', qty: 1, tanggal: '2026-06-24T16:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-011' },
  { id: 'm28', sparepartId: 's2', tipe: 'OUT', qty: 1, tanggal: '2026-06-25T09:30:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-009' },
  { id: 'm29', sparepartId: 's15', tipe: 'OUT', qty: 1, tanggal: '2026-06-25T09:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-016' },
  { id: 'm30', sparepartId: 's10', tipe: 'OUT', qty: 1, tanggal: '2026-06-25T11:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-001' },
  { id: 'm31', sparepartId: 's1', tipe: 'OUT', qty: 1, tanggal: '2026-06-25T11:30:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-015' },
  { id: 'm32', sparepartId: 's13', tipe: 'OUT', qty: 1, tanggal: '2026-06-25T12:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-004' },
  { id: 'm33', sparepartId: 's11', tipe: 'OUT', qty: 1, tanggal: '2026-06-25T16:00:00Z', keterangan: 'Dipakai untuk Servis SRV-20260625-020' },
];
