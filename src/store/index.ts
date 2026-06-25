import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StatusOrder } from '../components/ui/StatusBadge';
import { MOCK_CUSTOMERS, MOCK_SPAREPARTS, MOCK_ORDERS, MOCK_MUTASISTOK, MOCK_TECHNICIANS, DEFAULT_SETTINGS } from './mockData';

/**
 * Entitas Pelanggan (Customer).
 * Menyimpan informasi profil pelanggan serta metrik historis servis.
 */
export interface Customer {
  /** ID unik pelanggan (contoh: c1) */
  id: string;
  /** Nama lengkap pelanggan */
  nama: string;
  /** Nomor telepon / WhatsApp yang valid (digunakan untuk notifikasi) */
  noHp: string;
  /** Alamat domisili pelanggan (opsional) */
  alamat?: string;
  /** Total kuantitas perangkat yang pernah diservis oleh pelanggan ini */
  totalServis: number;
  /** Tanggal terakhir kali pelanggan melakukan servis (format ISO string) */
  terakhirServis: string;
}

/**
 * Entitas Suku Cadang (Sparepart).
 * Merepresentasikan item inventaris fisik yang digunakan dalam perbaikan.
 */
export interface Sparepart {
  /** ID unik SKU (contoh: s1) */
  id: string;
  /** Nama komponen / sparepart */
  nama: string;
  /** Kategori komponen (contoh: RAM, SSD, Layar) */
  kategori: string;
  /** Jumlah kuantitas fisik yang tersedia di gudang saat ini */
  stok: number;
  /** Ambang batas stok minimum untuk memicu notifikasi peringatan (low stock) */
  minStok: number;
  /** Harga Pokok Penjualan (HPP) / Modal (digunakan untuk kalkulasi laba bersih) */
  hargaModal: number;
  /** Harga Jual ke pelanggan (digunakan pada rincian tagihan) */
  harga: number;
  /** Persentase pajak yang dikenakan pada item ini (misal: 11 untuk PPN 11%) */
  pajak: number;
}

/**
 * Rekam Jejak Mutasi Inventaris (Stock Ledger).
 * Digunakan untuk melakukan *tracking* barang masuk (IN) maupun barang keluar (OUT).
 */
export interface MutasiStok {
  /** ID unik mutasi (contoh: m1) */
  id: string;
  /** Referensi ke ID dari entitas Sparepart yang termutasi */
  sparepartId: string;
  /** 
   * Arah pergerakan stok:
   * - `IN`: Pembelian / *Restock* / Retur dari order batal
   * - `OUT`: Pemakaian servis / Barang cacat / Hilang
   */
  tipe: 'IN' | 'OUT';
  /** Kuantitas barang yang masuk atau keluar */
  qty: number;
  /** Harga Beli per item pada saat mutasi (Hanya diwajibkan untuk tipe 'IN' guna menghitung HPP) */
  hargaBeli?: number;
  /** Waktu transaksi mutasi (format ISO string) */
  tanggal: string;
  /** Deskripsi atau alasan mutasi (contoh: "Restock distributor A" atau "Pengembalian batal order") */
  keterangan: string;
}

/**
 * Entitas Teknisi.
 * Menyimpan profil serta parameter performa SDM teknisi.
 */
export interface Technician {
  /** ID unik teknisi (contoh: t1) */
  id: string;
  /** Nama lengkap teknisi */
  name: string;
  /** URL atau path ke gambar profil teknisi */
  avatar: string;
  /** Nilai kepuasan pelanggan / skor performa teknisi (skala 1.0 - 5.0) */
  rating: number;
  /** Total pekerjaan yang berhasil diselesaikan oleh teknisi ini */
  jobs: number;
  /** Status keaktifan teknisi (true jika sedang bekerja/tersedia) */
  active: boolean;
}

/**
 * Role-Based Access Control (RBAC).
 * Mendefinisikan peran aksesibilitas aplikasi.
 */
export type Role = 'ADMIN' | 'TEKNISI';

/**
 * Konfigurasi Global Aplikasi (System Settings).
 * Diterapkan di seluruh modul termasuk format cetak dokumen dan integrasi.
 */
export interface Settings {
  /** Nama gerai / bengkel yang ditampilkan pada aplikasi dan nota */
  shopName: string;
  /** Nama pemilik gerai / penanggung jawab */
  ownerName: string;
  /** Alamat operasional yang ditampilkan pada nota kasir */
  address: string;
  /** Nomor kontak utama bengkel */
  phone: string;
  /** Format lebar kertas cetak kasir thermal (58mm atau 80mm) */
  printerWidth: '58mm' | '80mm';
  /** *Feature Flag*: Mengaktifkan integrasi rute WhatsApp Gateway secara otomatis */
  enableWA: boolean;
  /** *Feature Flag*: Mengaktifkan *push notification* / peringatan via UI aplikasi */
  enableNotifications: boolean;
}

/**
 * Entitas Order Servis (Job Order / Service Request).
 * Objek *root* untuk satu siklus bisnis perbaikan elektronik.
 * Merupakan agregat dari pelanggan, teknisi, sparepart, dan jasa.
 */
export interface Order {
  /** ID unik order (contoh: o1) */
  id: string;
  /** Nomor referensi faktur / servis yang manusiawi (contoh: SRV-20260625-001) */
  noServis: string;
  /** Referensi ke entitas Customer */
  pelangganId: string;
  /** Klasifikasi kategori perangkat (misal: "Laptop", "Handphone", "PC") */
  jenisPerangkat: string;
  /** Detail tipe produk (opsional, misal: "Asus ROG Strix G15") */
  merkModel?: string;
  /** Nomor Seri Identifikasi / SN / IMEI perangkat (opsional) */
  noSeri?: string;
  /** Penambahan aksesoris bawaan dari pelanggan (misal: "Charger", "Tas") */
  kelengkapan?: string[];
  /** Deskripsi simptom awal dari pelanggan (Voice of Customer) */
  keluhan: string;
  /** (Legacy) Log evaluasi tahap awal, *Deprecated*, lihat `hasilDiagnosa` */
  pemeriksaanAwal?: string;
  /** Analisa terperinci secara teknis setelah dilakukan observasi oleh Teknisi */
  hasilDiagnosa?: string;
  /** Biaya estimasi awal yang dijanjikan ke pelanggan saat *intake* (bisa berubah) */
  estimasiBiaya: number;
  /** Tarif Jasa Utama / Biaya *troubleshooting* dasar yang dikenakan */
  biayaJasa?: number;
  /** Tenggat waktu proyeksi penyelesaian servis (opsional, ISO string) */
  estimasiSelesai?: string;
  /** Log rahasia / Catatan pergantian *shift* antar pegawai dan kendala *sparepart* (hanya internal) */
  catatanInternal?: string;
  /** *Finite State Machine* dari tahapan proses operasional perbaikan perangkat */
  status: StatusOrder;
  /** Stempel waktu (Timestamp) masuknya order perangkat (ISO string) */
  tanggalMasuk: string;
  /** ID dari teknisi utama yang di-*assign* untuk memperbaiki (opsional jika belum ditunjuk) */
  teknisiId?: string;
  /** 
   * Rincian Suku Cadang Fisik yang digunakan pada perbaikan ini.
   * Setiap *entry* mengurangi stok saat dikonfirmasi, dan menambah inventaris ketika *Order* dibatalkan.
   */
  spareparts?: { id: string; qty: number }[];
  /** 
   * Rincian Jasa Kustom / Tambahan yang dieksekusi teknisi.
   * Fleksibel dan independen terhadap *Biaya Jasa Utama*. 
   */
  jasa?: { id: string; nama: string; harga: number }[];
}

/**
 * Antarmuka State Aplikasi (Zustand Store)
 * Mengelola seluruh data global aplikasi termasuk state persisten.
 */
interface AppState {
  /** Daftar seluruh pelanggan yang terdaftar di sistem */
  customers: Customer[];
  /** Daftar katalog sparepart beserta stok dan harga */
  spareparts: Sparepart[];
  /** Catatan mutasi (masuk/keluar) dari seluruh sparepart */
  mutasiStok: MutasiStok[];
  /** Daftar transaksi order servis (aktif maupun riwayat) */
  orders: Order[];
  /** Daftar teknisi yang tersedia di bengkel */
  technicians: Technician[];
  /** Pengaturan umum aplikasi (Nama toko, printer, dsb) */
  settings: Settings;
  /** Status autentikasi user saat ini */
  isAuthenticated: boolean;
  /** Role user saat ini (Admin atau Teknisi) */
  userRole: Role | null;
  /** ID user saat ini (berguna jika teknisi yang login) */
  userId: string | null;
  /** Nama user saat ini */
  userName: string | null;

  /**
   * Melakukan proses login admin.
   * @param username - Username admin
   * @param pass - Password admin
   * @returns Promise boolean status keberhasilan login
   */
  login: (username: string, pass: string) => Promise<boolean>;

  /** Mengakhiri sesi pengguna saat ini */
  logout: () => void;

  /**
   * Mendaftarkan order servis baru.
   * ID, Nomor Servis, dan Tanggal Masuk di-generate secara otomatis.
   * @param order - Data order tanpa atribut auto-generated
   */
  addOrder: (order: Omit<Order, 'id' | 'noServis' | 'tanggalMasuk'>) => void;

  /**
   * Memperbarui status dari sebuah order servis.
   * @param orderId - ID dari order yang akan diupdate
   * @param status - Status terbaru (misal: 'PROSES', 'SELESAI')
   */
  updateOrderStatus: (orderId: string, status: StatusOrder) => void;

  /**
   * Memperbarui atribut apapun pada order servis.
   * @param orderId - ID order target
   * @param updates - Partial object berisi data yang ingin diubah
   */
  updateOrder: (orderId: string, updates: Partial<Order>) => void;

  /**
   * Memperbarui data sparepart (nama, kategori, harga, dsb).
   * @param id - ID sparepart target
   * @param updates - Partial object berisi pembaruan data
   */
  updateSparepart: (id: string, updates: Partial<Sparepart>) => void;

  /**
   * Menambahkan sparepart baru ke dalam katalog.
   * @param sparepart - Data sparepart baru
   */
  addSparepart: (sparepart: Omit<Sparepart, 'id'>) => void;

  /**
   * Mencatat mutasi stok (Stok Masuk / Stok Keluar).
   * Secara otomatis akan menghitung ulang jumlah stok saat ini, 
   * dan menghitung HPP (Harga Pokok Penjualan) dengan metode Weighted Average jika stok masuk.
   * @param mutasi - Data mutasi tanpa ID dan Tanggal
   */
  tambahMutasiStok: (mutasi: Omit<MutasiStok, 'id' | 'tanggal'>) => void;

  /**
   * Mendaftarkan pelanggan baru.
   * @param customer - Data pelanggan
   * @returns String berupa ID pelanggan yang baru dibuat
   */
  addCustomer: (customer: Omit<Customer, 'id' | 'totalServis' | 'terakhirServis'>) => string;

  /**
   * Memperbarui konfigurasi/pengaturan bengkel.
   * @param updates - Pembaruan konfigurasi
   */
  updateSettings: (updates: Partial<Settings>) => void;

  /**
   * Memperbarui data profil/metrik teknisi.
   * @param id - ID teknisi
   * @param updates - Data yang diubah
   */
  updateTechnician: (id: string, updates: Partial<Technician>) => void;
}



export const useStore = create<AppState>()(
  persist(
    (set) => ({
      customers: MOCK_CUSTOMERS,
      spareparts: MOCK_SPAREPARTS,
      mutasiStok: MOCK_MUTASISTOK,
      orders: MOCK_ORDERS,
      technicians: MOCK_TECHNICIANS,
      settings: DEFAULT_SETTINGS,
      isAuthenticated: false,
      userRole: null,
      userId: null,
      userName: null,

      login: async (username, pass) => {
        // Simulasi delay jaringan
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        // RBAC Logic
        if (username === 'admin' && pass === 'admin') {
          set({ isAuthenticated: true, userRole: 'ADMIN', userId: 'admin', userName: 'Administrator' });
          return true;
        } else if (username === 'teknisi' && pass === 'teknisi') {
          set({ isAuthenticated: true, userRole: 'TEKNISI', userId: 't1', userName: 'Deni Setiawan' });
          return true;
        }
        
        return false;
      },

      logout: () => {
        set({ 
          isAuthenticated: false,
          userRole: null,
          userId: null,
          userName: null
        });
      },

      addOrder: (newOrderData) => set((state) => {
        const newId = `o${state.orders.length + 1}`;
        const date = new Date();
        const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
        const numString = String(state.orders.length + 1).padStart(3, '0');
        const noServis = `SRV-${dateString}-${numString}`;
        
        const newOrder: Order = {
          ...newOrderData,
          id: newId,
          noServis,
          tanggalMasuk: date.toISOString(),
        };
        
        return { orders: [newOrder, ...state.orders] };
      }),
      updateOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
      })),
      updateOrder: (orderId, updates) => set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, ...updates } : o)
      })),
      updateSparepart: (id, updates) => set((state) => ({
        spareparts: state.spareparts.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      addSparepart: (newSparepartData) => set((state) => ({
        spareparts: [...state.spareparts, { ...newSparepartData, id: `s${state.spareparts.length + 1}` }]
      })),
      tambahMutasiStok: (mutasiData) => set((state) => {
        const newMutasi: MutasiStok = {
          ...mutasiData,
          id: `m${Date.now()}`,
          tanggal: new Date().toISOString()
        };
        
        // Update stok sparepart and Average Cost (HPP)
        const spareparts = state.spareparts.map(sp => {
          if (sp.id === mutasiData.sparepartId) {
            let newStok = sp.stok;
            let newHargaModal = sp.hargaModal;

            if (mutasiData.tipe === 'IN') {
              const qtyIn = mutasiData.qty;
              const hargaBeli = mutasiData.hargaBeli || sp.hargaModal;
              
              // Hitung Average Cost (HPP)
              const oldTotalValue = Math.max(0, sp.stok) * sp.hargaModal;
              const newTotalValue = qtyIn * hargaBeli;
              const totalQty = Math.max(0, sp.stok) + qtyIn;
              
              newHargaModal = totalQty > 0 ? Math.round((oldTotalValue + newTotalValue) / totalQty) : hargaBeli;
              newStok = sp.stok + qtyIn;
            } else {
              newStok = Math.max(0, sp.stok - mutasiData.qty);
            }

            return { ...sp, stok: newStok, hargaModal: newHargaModal };
          }
          return sp;
        });

        return { 
          mutasiStok: [newMutasi, ...state.mutasiStok],
          spareparts
        };
      }),
      addCustomer: (newCustomerData) => {
        let newId = '';
        set((state) => {
          newId = `c${state.customers.length + 1}`;
          const newCustomer: Customer = {
            ...newCustomerData,
            id: newId,
            totalServis: 0,
            terakhirServis: new Date().toISOString(),
          };
          return { customers: [...state.customers, newCustomer] };
        });
        return newId;
      },
      updateSettings: (updates) => set((state) => ({ 
        settings: { ...state.settings, ...updates } 
      })),
      updateTechnician: (id, updates) => set((state) => ({
        technicians: state.technicians.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),
    }),
    {
      name: 'servisku-storage-v2',
    }
  )
);
