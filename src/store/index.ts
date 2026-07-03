import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StatusOrder } from "../components/ui/StatusBadge";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  getCustomers,
  getSpareparts,
  getOrders,
  getMutasiStok,
  getTechnicians,
  getSettings,
  createCustomer,
  createSparepartDB,
  createOrderDB,
  createMutasiStokDB,
  updateCustomerDB,
  updateSparepartDB,
  updateOrderDB,
  updateTechnicianDB,
  updateSettingsDB,
  deleteCustomerDB,
  deleteSparepartDB,
  getUsers,
  createUserDB,
  updateUserDB,
  deleteUserDB,
} from "../services/backendServices";
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
  /** Email pelanggan (opsional) */
  email?: string;
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
  /** Merek atau Brand dari komponen (opsional) */
  merek?: string;
  /** Lokasi penyimpanan atau Rak di gudang (opsional) */
  rak?: string;
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
  tipe: "IN" | "OUT";
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
export type Role = "OWNER" | "FRONTLINE" | "FINANCE" | "INVENTORY" | "TEKNISI";

export interface AppUser {
  id: string;
  authId?: string;
  username: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  position: string;
  avatar: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  details: string;
}

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
  printerWidth: "58mm" | "80mm";
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
  /** Tingkat prioritas pesanan */
  prioritas?: 'NORMAL' | 'HIGH' | 'URGENT';
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
  /**
   * Log Riwayat Perubahan Status (Timeline).
   * Mencatat setiap transisi status beserta waktu dan pelakunya.
   */
  history?: { status: StatusOrder; date: string; by: string }[];
}

/**
 * Antarmuka State Aplikasi (Zustand Store)
 * Mengelola seluruh data global aplikasi termasuk state persisten.
 */
interface AppState {
  updateCustomer: (
  id: string,
  updates: Omit<Customer, 'id' | 'totalServis' | 'terakhirServis'>
) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
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
  /** Status sidebar diciutkan atau tidak (responsive desktop) */
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  /** Data seluruh pengguna sistem */
  users: AppUser[];
  /** Log Aktivitas */
  auditLogs: AuditLog[];
  
  logActivity: (action: string, details: string) => void;
  clearLogs: () => void;
  updateProfile: (updates: Partial<AppUser>) => Promise<void>;
  changePassword: (newPass: string) => Promise<boolean>;
  resetUserPassword: (id: string, newPass: string) => Promise<void>;
  addUser: (user: Omit<AppUser, 'id'>, initialPassword?: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<AppUser>) => Promise<void>;

  /**
   * Melakukan proses login admin.
   * @param username - Username admin
   * @param pass - Password admin
   * @returns Promise boolean status keberhasilan login
   */
  login: (username: string, pass: string) => Promise<boolean>;

  /** Memuat semua data backend dan men-seed jika masih kosong */
  loadInitialData: () => Promise<void>;

  /** Mengakhiri sesi pengguna saat ini */
  logout: () => void;

  /**
   * Mendaftarkan order servis baru.
   * ID, Nomor Servis, dan Tanggal Masuk di-generate secara otomatis.
   * @param order - Data order tanpa atribut auto-generated
   */
  addOrder: (order: Omit<Order, "id" | "noServis" | "tanggalMasuk">) => void;

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
  addSparepart: (sparepart: Sparepart) => void;
  deleteSparepart: (id: string) => Promise<void>;

  /**
   * Mencatat mutasi stok (Stok Masuk / Stok Keluar).
   * Secara otomatis akan menghitung ulang jumlah stok saat ini,
   * dan menghitung HPP (Harga Pokok Penjualan) dengan metode Weighted Average jika stok masuk.
   * @param mutasi - Data mutasi tanpa ID dan Tanggal
   */
  tambahMutasiStok: (mutasi: Omit<MutasiStok, "id" | "tanggal">) => void;

  /**
   * Mendaftarkan pelanggan baru.
   * @param customer - Data pelanggan
   * @returns String berupa ID pelanggan yang baru dibuat
   */
  loadCustomers: () => Promise<void>;
  addCustomer: (
    customer: Omit<Customer, "id" | "totalServis" | "terakhirServis">,
  ) => Promise<string>;

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
    (set, get) => ({
      updateCustomer: async (id, data) => {
        await updateCustomerDB(id, data);

        const customers = await getCustomers();

        set({ customers });
      },
      deleteCustomer: async (id) => {
        await deleteCustomerDB(id);

        const customers = await getCustomers();

        set({ customers });
      },
      loadInitialData: async () => {
        try {
          const [customers, spareparts, orders, mutasiStok, technicians, settings, users] = await Promise.all([
            getCustomers(),
            getSpareparts(),
            getOrders(),
            getMutasiStok(),
            getTechnicians(),
            getSettings(),
            getUsers(),
          ]);

          set({ customers, spareparts, orders, mutasiStok, technicians, settings, users });
        } catch (error) {
          console.error(error);
        }
      },
      loadCustomers: async () => {
        try {
          const customers = await getCustomers();
          set({ customers });
        } catch (error) {
          console.error(error);
        }
      },
      customers: [],
      spareparts: [],
      mutasiStok: [],
      orders: [],
      technicians: [],
      settings: {
        shopName: "ServisKu Repair",
        ownerName: "Pak Teten",
        address: "Jl. Teknologi No. 123, Jakarta",
        phone: "081234567890",
        printerWidth: "58mm",
        enableWA: true,
        enableNotifications: true,
      },
      isAuthenticated: false,
      userRole: null,
      userId: null,
      userName: null,
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state: AppState) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      users: [],
      auditLogs: [],

      clearLogs: () => set({ auditLogs: [] }),

      logActivity: (action, details) => set((state: AppState) => {
        if (!state.userId || !state.userName || !state.userRole) return {};
        const newLog: AuditLog = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: state.userId,
          userName: state.userName,
          role: state.userRole,
          action,
          details
        };
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const filteredLogs = state.auditLogs.filter((log: AuditLog) => new Date(log.timestamp) >= thirtyDaysAgo);

        return { auditLogs: [newLog, ...filteredLogs] };
      }),
      
      updateProfile: async (updates) => {
        const state = get();
        if (!state.userId) return;
        await updateUserDB(state.userId, updates);
        const users = await getUsers();
        const newUserName = updates.name !== undefined ? updates.name : state.userName;
        set({ users, userName: newUserName });
      },
      
      changePassword: async (newPass) => {
        const state = get();
        if (!state.userId) return false;
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) {
          console.error("Gagal ganti password:", error);
          return false;
        }
        return true;
      },
      
      addUser: async (user, initialPassword) => {
        let authId: string | undefined = undefined;
        if (initialPassword) {
          const emailAlias = `${user.username}@servisku.internal`;
          // Buat client terpisah agar session owner tidak ter-overwrite saat sign up user baru
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          const tempClient = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false }
          });
          
          const { data, error } = await tempClient.auth.signUp({
            email: emailAlias,
            password: initialPassword,
          });

          if (error) {
            console.error("Gagal mendaftarkan user di Supabase Auth:", error);
          } else if (data?.user) {
            authId = data.user.id;
          }
        }
        
        await createUserDB(user, authId);
        const users = await getUsers();
        set({ users });
      },
      deleteUser: async (id) => {
        await deleteUserDB(id);
        const users = await getUsers();
        set({ users });
      },
      updateUser: async (id, updates) => {
        await updateUserDB(id, updates);
        const users = await getUsers();
        set({ users });
      },
      resetUserPassword: async () => {
        console.warn("Reset password dari frontend dengan anon key membutuhkan setup khusus. Saat ini belum diimplementasikan.");
      },

      login: async (username, pass) => {
        const emailAlias = `${username}@servisku.internal`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailAlias,
          password: pass
        });

        if (error || !data.session) {
          return false;
        }

        const dbUsers = await getUsers();
        set({ users: dbUsers });
        
        const user = dbUsers.find(u => u.username === username && u.isActive);
        
        if (user) {
          set({
            isAuthenticated: true,
            userRole: user.role,
            userId: user.id,
            userName: user.name,
          });
          get().logActivity("LOGIN", "Pengguna masuk ke sistem");
          return true;
        }
        
        return false;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          isAuthenticated: false,
          userRole: null,
          userId: null,
          userName: null,
        });
      },

      updateOrderStatus: (orderId, status) => {
        set((state: AppState) => {
          const userName = state.userName || 'Sistem';
          const newHistoryItem = { status, date: new Date().toISOString(), by: userName };
          const nextOrders = state.orders.map((o: Order) => {
            if (o.id === orderId) {
              const currentHistory = o.history || [];
              const lastStatus = currentHistory.length > 0 ? currentHistory[currentHistory.length - 1].status : null;
              
              // Mencegah status yang sama masuk dua kali berturut-turut
              if (lastStatus === status) {
                return o;
              }
              
              return { ...o, status, history: [...currentHistory, newHistoryItem] };
            }
            return o;
          });
          const targetOrder = nextOrders.find((o: Order) => o.id === orderId);
          if (targetOrder) {
            void updateOrderDB(orderId, { status, history: targetOrder.history });
          }
          return { orders: nextOrders };
        });
        get().logActivity("UPDATE_ORDER", `Mengubah status order ${orderId} menjadi ${status}`);
      },
      updateOrder: (orderId, updates) =>
        set((state: AppState) => {
          const nextOrders = state.orders.map((o: Order) =>
            o.id === orderId ? { ...o, ...updates } : o,
          );
          void updateOrderDB(orderId, updates);
          return { orders: nextOrders };
        }),
      updateSparepart: (id, updates) =>
        set((state: AppState) => {
          const nextSpareparts = state.spareparts.map((s: Sparepart) =>
            s.id === id ? { ...s, ...updates } : s,
          );
          void updateSparepartDB(id, updates);
          return { spareparts: nextSpareparts };
        }),
      addSparepart: (newSparepartData) => {
        set((state: AppState) => {
          void createSparepartDB(newSparepartData);
          return {
            spareparts: [...state.spareparts, newSparepartData],
          };
        });
        get().logActivity("ADD_SPAREPART", `Menambahkan sparepart baru: ${newSparepartData.nama}`);
      },
      deleteSparepart: async (id) => {
        await deleteSparepartDB(id);
        const spareparts = await getSpareparts();
        set({ spareparts });
        get().logActivity("DELETE_SPAREPART", `Menghapus sparepart ID: ${id}`);
      },
      tambahMutasiStok: (mutasiData) =>
        set((state: AppState) => {
          const newMutasi: MutasiStok = {
            ...mutasiData,
            id: crypto.randomUUID(),
            tanggal: new Date().toISOString(),
          };

          // Update stok sparepart and Average Cost (HPP)
          const spareparts = state.spareparts.map((sp: Sparepart) => {
            if (sp.id === mutasiData.sparepartId) {
              let newStok = sp.stok;
              let newHargaModal = sp.hargaModal;

              if (mutasiData.tipe === "IN") {
                const qtyIn = mutasiData.qty;
                const hargaBeli = mutasiData.hargaBeli || sp.hargaModal;

                // Hitung Average Cost (HPP)
                const oldTotalValue = Math.max(0, sp.stok) * sp.hargaModal;
                const newTotalValue = qtyIn * hargaBeli;
                const totalQty = Math.max(0, sp.stok) + qtyIn;

                newHargaModal =
                  totalQty > 0
                    ? Math.round((oldTotalValue + newTotalValue) / totalQty)
                    : hargaBeli;
                newStok = sp.stok + qtyIn;
              } else {
                newStok = Math.max(0, sp.stok - mutasiData.qty);
              }

              return { ...sp, stok: newStok, hargaModal: newHargaModal };
            }
            return sp;
          });

          const nextState = {
            mutasiStok: [newMutasi, ...state.mutasiStok],
            spareparts,
          };

          // ✅ FIX: Sinkronisasi nilai stok baru ke Supabase setelah mutasi
          // Tanpa ini, stok di DB tidak pernah berubah walau UI tampak benar
          const updatedSp = spareparts.find((sp: Sparepart) => sp.id === mutasiData.sparepartId);
          if (updatedSp) {
            void updateSparepartDB(updatedSp.id, {
              stok: updatedSp.stok,
              hargaModal: updatedSp.hargaModal,
            });
          }
          void createMutasiStokDB(newMutasi);

          return nextState;
        }),
      addCustomer: async (newCustomerData) => {
        const createdId = await createCustomer(newCustomerData);

        set((state: AppState) => ({
          customers: [
            {
              ...newCustomerData,
              id: createdId,
              totalServis: 0,
              terakhirServis: new Date().toISOString(),
            },
            ...state.customers,
          ],
        }));

        return createdId;
      },
      updateSettings: (updates) =>
        set((state: AppState) => {
          const nextSettings = { ...state.settings, ...updates };
          void updateSettingsDB(updates);
          return { settings: nextSettings };
        }),
      updateTechnician: (id, updates) =>
        set((state: AppState) => {
          const nextTechnicians = state.technicians.map((t: Technician) =>
            t.id === id ? { ...t, ...updates } : t,
          );
          void updateTechnicianDB(id, updates);
          return { technicians: nextTechnicians };
        }),
      addOrder: (newOrderData) =>
        set((state: AppState) => {
          // ✅ ID unik berbasis timestamp untuk mencegah collision saat data dihapus/di-reload
          const newId = crypto.randomUUID();
          const date = new Date();
          const dateString = date.toISOString().split("T")[0].replace(/-/g, "");
          // ✅ Nomor servis unik berbasis timestamp (6 digit terakhir) — bukan length array
          const numString = String(Date.now()).slice(-6);
          const noServis = `SRV-${dateString}-${numString}`;

          const newOrder: Order = {
            ...newOrderData,
            id: newId,
            noServis,
            tanggalMasuk: date.toISOString(),
          };

          void createOrderDB(newOrder);

          return { orders: [newOrder, ...state.orders] };
        }),
    }),
    {
      name: "servisku-storage-v5",
      // ✅ FIX: Saat rehydrate dari localStorage, selalu panggil loadInitialData
      // agar data Supabase (source of truth) menimpa cache localStorage
      onRehydrateStorage: () => {
        return (state) => {
          // Setelah localStorage selesai di-rehydrate, langsung fetch dari Supabase
          if (state) {
            state.loadInitialData();
          }
        };
      },
      // ✅ FIX: Hanya simpan field data esensial ke localStorage (bukan fungsi)
      // Ini mencegah cache basi dari menimpa data fresh
      partialize: (state) => ({
        customers: state.customers,
        spareparts: state.spareparts,
        orders: state.orders,
        mutasiStok: state.mutasiStok,
        technicians: state.technicians,
        settings: state.settings,
        users: state.users,
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        userId: state.userId,
        userName: state.userName,
        isSidebarCollapsed: state.isSidebarCollapsed,
        auditLogs: state.auditLogs,
      }),
      // ✅ FIX: Merge strategy — data dari Supabase (loadInitialData) selalu menang
      merge: (persistedState: any, currentState: any) => {
        return {
          ...currentState,
          ...persistedState,
        };
      },
    },
  ),
);
