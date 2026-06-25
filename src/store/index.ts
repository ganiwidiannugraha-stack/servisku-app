import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StatusOrder } from '../components/ui/StatusBadge';
import { MOCK_CUSTOMERS, MOCK_SPAREPARTS, MOCK_ORDERS, MOCK_MUTASISTOK, MOCK_TECHNICIANS, DEFAULT_SETTINGS } from './mockData';

export interface Customer {
  id: string;
  nama: string;
  noHp: string;
  alamat?: string;
  totalServis: number;
  terakhirServis: string;
}

export interface Sparepart {
  id: string;
  nama: string;
  kategori: string;
  stok: number;
  minStok: number;
  hargaModal: number; // Cost price
  harga: number; // Selling price (used to be just harga)
  pajak: number; // Tax percentage e.g., 11 for 11%
}

export interface MutasiStok {
  id: string;
  sparepartId: string;
  tipe: 'IN' | 'OUT';
  qty: number;
  hargaBeli?: number; // Only for 'IN' type
  tanggal: string;
  keterangan: string;
}

export interface Technician {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  jobs: number;
  active: boolean;
}

export interface Settings {
  shopName: string;
  ownerName: string;
  address: string;
  phone: string;
  printerWidth: '58mm' | '80mm';
  enableWA: boolean;
  enableNotifications: boolean;
}

export interface Order {
  id: string;
  noServis: string;
  pelangganId: string;
  jenisPerangkat: string;
  merkModel?: string;
  noSeri?: string;
  kelengkapan?: string[];
  keluhan: string;
  pemeriksaanAwal?: string;
  hasilDiagnosa?: string;
  estimasiBiaya: number;
  biayaJasa?: number;
  estimasiSelesai?: string;
  catatanInternal?: string;
  status: StatusOrder;
  tanggalMasuk: string;
  teknisiId?: string;
  spareparts?: { id: string; qty: number }[];
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

      login: async (username, password) => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        // Hardcoded admin logic for demo
        if (username === 'admin' && password === 'admin123') {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false }),

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
