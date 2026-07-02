import { supabase } from "../lib/supabase";
import { DEFAULT_SETTINGS } from "../store/mockData";
import type { AppUser, Customer, MutasiStok, Order, Settings, Sparepart, Technician } from "../store";
import type { StatusOrder } from "../components/ui/StatusBadge";

type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  role: AppUser["role"];
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  avatar: string | null;
  is_active: boolean;
};

type CustomerRow = {
  id: string;
  nama: string;
  no_hp: string;
  email?: string | null;
  alamat?: string | null;
  total_servis: number;
  terakhir_servis: string;
};

type SparepartRow = {
  id: string;
  nama: string;
  kategori: string;
  merek?: string | null;
  rak?: string | null;
  stok: number;
  min_stok: number;
  harga_modal: number;
  harga: number;
  pajak: number;
};

type TechnicianRow = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  jobs: number;
  active: boolean;
};

type OrderRow = {
  id: string;
  no_servis: string;
  pelanggan_id: string;
  jenis_perangkat: string;
  merk_model?: string | null;
  no_seri?: string | null;
  kelengkapan?: string[] | null;
  keluhan: string;
  pemeriksaan_awal?: string | null;
  hasil_diagnosa?: string | null;
  estimasi_biaya: number;
  biaya_jasa?: number | null;
  estimasi_selesai?: string | null;
  catatan_internal?: string | null;
  prioritas?: 'NORMAL' | 'HIGH' | 'URGENT' | null;
  status: StatusOrder;
  tanggal_masuk: string;
  teknisi_id?: string | null;
  spareparts?: { id: string; qty: number }[] | null;
  jasa?: { id: string; nama: string; harga: number }[] | null;
};

type MutasiRow = {
  id: string;
  sparepart_id: string;
  jenis: "MASUK" | "KELUAR";
  jumlah: number;
  harga_beli?: number | null;
  tanggal: string;
  keterangan?: string | null;
};

type SettingsRow = {
  id: string;
  shop_name: string;
  owner_name: string;
  address: string;
  phone: string;
  printer_width: "58mm" | "80mm";
  enable_wa: boolean;
  enable_notifications: boolean;
};

const settingsId = "default";

const mapUser = (row: UserRow): AppUser => ({
  id: row.id,
  username: row.username,
  passwordHash: row.password_hash,
  role: row.role,
  name: row.name,
  email: row.email || "",
  phone: row.phone || "",
  position: row.position || "",
  avatar: row.avatar || row.name.charAt(0),
  isActive: row.is_active,
});

const toUserRow = (user: Omit<AppUser, "id">, id?: string): Partial<UserRow> => {
  const row: Partial<UserRow> = {
    username: user.username,
    password_hash: user.passwordHash,
    role: user.role,
    name: user.name,
    email: user.email || null,
    phone: user.phone || null,
    position: user.position || null,
    avatar: user.avatar || null,
    is_active: user.isActive,
  };
  if (id) row.id = id;
  return row;
};

const mapCustomer = (row: CustomerRow): Customer => ({
  id: row.id,
  nama: row.nama,
  noHp: row.no_hp,
  email: row.email || undefined,
  alamat: row.alamat || undefined,
  totalServis: row.total_servis,
  terakhirServis: row.terakhir_servis,
});

const toCustomerRow = (
  customer: Omit<Customer, "id" | "totalServis" | "terakhirServis">,
  id: string,
): CustomerRow => ({
  id,
  nama: customer.nama,
  no_hp: customer.noHp,
  email: customer.email || null,
  alamat: customer.alamat || null,
  total_servis: 0,
  terakhir_servis: new Date().toISOString(),
});

const mapSparepart = (row: SparepartRow): Sparepart => ({
  id: row.id,
  nama: row.nama,
  kategori: row.kategori,
  merek: row.merek || undefined,
  rak: row.rak || undefined,
  stok: row.stok,
  minStok: row.min_stok,
  hargaModal: row.harga_modal,
  harga: row.harga,
  pajak: row.pajak,
});

const toSparepartRow = (
  sparepart: Omit<Sparepart, "id">,
  id: string,
): SparepartRow => ({
  id,
  nama: sparepart.nama,
  kategori: sparepart.kategori,
  merek: sparepart.merek || null,
  rak: sparepart.rak || null,
  stok: sparepart.stok,
  min_stok: sparepart.minStok,
  harga_modal: sparepart.hargaModal,
  harga: sparepart.harga,
  pajak: sparepart.pajak,
});

const mapTechnician = (row: TechnicianRow): Technician => ({
  id: row.id,
  name: row.name,
  avatar: row.avatar,
  rating: row.rating,
  jobs: row.jobs,
  active: row.active,
});

const mapOrder = (row: OrderRow): Order => ({
  id: row.id,
  noServis: row.no_servis,
  pelangganId: row.pelanggan_id,
  jenisPerangkat: row.jenis_perangkat,
  merkModel: row.merk_model || undefined,
  noSeri: row.no_seri || undefined,
  kelengkapan: row.kelengkapan || undefined,
  keluhan: row.keluhan,
  pemeriksaanAwal: row.pemeriksaan_awal || undefined,
  hasilDiagnosa: row.hasil_diagnosa || undefined,
  estimasiBiaya: row.estimasi_biaya,
  biayaJasa: row.biaya_jasa ?? undefined,
  estimasiSelesai: row.estimasi_selesai || undefined,
  catatanInternal: row.catatan_internal || undefined,
  prioritas: row.prioritas || undefined,
  status: row.status,
  tanggalMasuk: row.tanggal_masuk,
  teknisiId: row.teknisi_id || undefined,
  spareparts: row.spareparts || undefined,
  jasa: row.jasa || undefined,
});

const toOrderRow = (order: Order): OrderRow => ({
  id: order.id,
  no_servis: order.noServis,
  pelanggan_id: order.pelangganId,
  jenis_perangkat: order.jenisPerangkat,
  merk_model: order.merkModel || null,
  no_seri: order.noSeri || null,
  kelengkapan: order.kelengkapan || null,
  keluhan: order.keluhan,
  pemeriksaan_awal: order.pemeriksaanAwal || null,
  hasil_diagnosa: order.hasilDiagnosa || null,
  estimasi_biaya: order.estimasiBiaya,
  biaya_jasa: order.biayaJasa ?? null,
  estimasi_selesai: order.estimasiSelesai || null,
  catatan_internal: order.catatanInternal || null,
  prioritas: order.prioritas || null,
  status: order.status,
  tanggal_masuk: order.tanggalMasuk,
  teknisi_id: order.teknisiId || null,
  spareparts: order.spareparts || null,
  jasa: order.jasa || null,
});

const mapMutasi = (row: MutasiRow): MutasiStok => ({
  id: row.id,
  sparepartId: row.sparepart_id,
  tipe: row.jenis === "MASUK" ? "IN" : "OUT",
  qty: row.jumlah,
  hargaBeli: row.harga_beli ?? undefined,
  tanggal: row.tanggal,
  keterangan: row.keterangan || undefined,
});

const toMutasiRow = (mutasi: MutasiStok): MutasiRow => ({
  id: mutasi.id,
  sparepart_id: mutasi.sparepartId,
  jenis: mutasi.tipe === "IN" ? "MASUK" : "KELUAR",
  jumlah: mutasi.qty,
  harga_beli: mutasi.hargaBeli ?? null,
  tanggal: mutasi.tanggal,
  keterangan: mutasi.keterangan || null,
});

const mapSettings = (row: SettingsRow): Settings => ({
  shopName: row.shop_name,
  ownerName: row.owner_name,
  address: row.address,
  phone: row.phone,
  printerWidth: row.printer_width,
  enableWA: row.enable_wa,
  enableNotifications: row.enable_notifications,
});



/**
 * Mengecek apakah sebuah tabel di Supabase masih kosong.
 * Menggunakan count query (HEAD request) agar tidak menarik seluruh data.
 * @param tableName - Nama tabel yang dicek
 */


export async function getCustomers() {
  const { data, error } = await supabase.from("customers").select("*");
  if (error) throw error;
  return (data || []).map((row) => mapCustomer(row as CustomerRow));
}

export async function createCustomer(customer: Omit<Customer, "id" | "totalServis" | "terakhirServis">) {
  const id = `c${Date.now()}`;
  const { error } = await supabase.from("customers").insert(toCustomerRow(customer, id));
  if (error) throw error;
  return id;
}

export async function updateCustomerDB(
  id: string,
  updates: {
    nama?: string;
    noHp?: string;
    email?: string;
    alamat?: string;
  },
) {
  const payload: Partial<CustomerRow> = {};
  if (updates.nama !== undefined) payload.nama = updates.nama;
  if (updates.noHp !== undefined) payload.no_hp = updates.noHp;
  if (updates.email !== undefined) payload.email = updates.email || null;
  if (updates.alamat !== undefined) payload.alamat = updates.alamat || null;

  const { error } = await supabase
    .from("customers")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCustomerDB(id: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

export async function getSpareparts() {
  const { data, error } = await supabase.from("spareparts").select("*");
  if (error) throw error;
  return (data || []).map((row) => mapSparepart(row as SparepartRow));
}

export async function createSparepartDB(sparepart: Omit<Sparepart, "id"> & { id: string }) {
  const { error } = await supabase.from("spareparts").insert(toSparepartRow(sparepart, sparepart.id));
  if (error) throw error;
}

export async function updateSparepartDB(id: string, updates: Partial<Sparepart>) {
  const payload: Partial<SparepartRow> = {};
  if (updates.nama !== undefined) payload.nama = updates.nama;
  if (updates.kategori !== undefined) payload.kategori = updates.kategori;
  if (updates.merek !== undefined) payload.merek = updates.merek || null;
  if (updates.rak !== undefined) payload.rak = updates.rak || null;
  if (updates.stok !== undefined) payload.stok = updates.stok;
  if (updates.minStok !== undefined) payload.min_stok = updates.minStok;
  if (updates.hargaModal !== undefined) payload.harga_modal = updates.hargaModal;
  if (updates.harga !== undefined) payload.harga = updates.harga;
  if (updates.pajak !== undefined) payload.pajak = updates.pajak;

  const { error } = await supabase.from("spareparts").update(payload).eq("id", id);
  if (error) throw error;
}

export async function getTechnicians() {
  const { data, error } = await supabase.from("technicians").select("*");
  if (error) throw error;
  return (data || []).map((row) => mapTechnician(row as TechnicianRow));
}

export async function updateTechnicianDB(id: string, updates: Partial<Technician>) {
  const payload: Partial<TechnicianRow> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.avatar !== undefined) payload.avatar = updates.avatar;
  if (updates.rating !== undefined) payload.rating = updates.rating;
  if (updates.jobs !== undefined) payload.jobs = updates.jobs;
  if (updates.active !== undefined) payload.active = updates.active;

  const { error } = await supabase.from("technicians").update(payload).eq("id", id);
  if (error) throw error;
}

export async function getOrders() {
  const { data, error } = await supabase.from("orders").select("*");
  if (error) throw error;
  return (data || []).map((row) => mapOrder(row as OrderRow));
}

export async function createOrderDB(order: Order) {
  const { error } = await supabase.from("orders").insert(toOrderRow(order));
  if (error) throw error;
}

export async function updateOrderDB(id: string, updates: Partial<Order>) {
  const payload: Partial<OrderRow> = {};
  if (updates.noServis !== undefined) payload.no_servis = updates.noServis;
  if (updates.pelangganId !== undefined) payload.pelanggan_id = updates.pelangganId;
  if (updates.jenisPerangkat !== undefined) payload.jenis_perangkat = updates.jenisPerangkat;
  if (updates.merkModel !== undefined) payload.merk_model = updates.merkModel || null;
  if (updates.noSeri !== undefined) payload.no_seri = updates.noSeri || null;
  if (updates.kelengkapan !== undefined) payload.kelengkapan = updates.kelengkapan || null;
  if (updates.keluhan !== undefined) payload.keluhan = updates.keluhan;
  if (updates.pemeriksaanAwal !== undefined) payload.pemeriksaan_awal = updates.pemeriksaanAwal || null;
  if (updates.hasilDiagnosa !== undefined) payload.hasil_diagnosa = updates.hasilDiagnosa || null;
  if (updates.estimasiBiaya !== undefined) payload.estimasi_biaya = updates.estimasiBiaya;
  if (updates.biayaJasa !== undefined) payload.biaya_jasa = updates.biayaJasa ?? null;
  if (updates.estimasiSelesai !== undefined) payload.estimasi_selesai = updates.estimasiSelesai || null;
  if (updates.catatanInternal !== undefined) payload.catatan_internal = updates.catatanInternal || null;
  if (updates.prioritas !== undefined) payload.prioritas = updates.prioritas || null;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.tanggalMasuk !== undefined) payload.tanggal_masuk = updates.tanggalMasuk;
  if (updates.teknisiId !== undefined) payload.teknisi_id = updates.teknisiId || null;
  if (updates.spareparts !== undefined) payload.spareparts = updates.spareparts || null;
  if (updates.jasa !== undefined) payload.jasa = updates.jasa || null;

  const { error } = await supabase.from("orders").update(payload).eq("id", id);
  if (error) throw error;
}

export async function updateOrderStatusDB(id: string, status: StatusOrder) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function getMutasiStok() {
  const { data, error } = await supabase.from("mutasi_stok").select("*");
  if (error) throw error;
  return (data || []).map((row) => mapMutasi(row as MutasiRow));
}

export async function createMutasiStokDB(mutasi: MutasiStok) {
  const { error } = await supabase.from("mutasi_stok").insert(toMutasiRow(mutasi));
  if (error) throw error;
}

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*");
  if (error) throw error;
  const row = (data || [])[0] as SettingsRow | undefined;
  return row ? mapSettings(row) : DEFAULT_SETTINGS;
}

export async function updateSettingsDB(updates: Partial<Settings>) {
  const payload: Partial<SettingsRow> = {};
  if (updates.shopName !== undefined) payload.shop_name = updates.shopName;
  if (updates.ownerName !== undefined) payload.owner_name = updates.ownerName;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.printerWidth !== undefined) payload.printer_width = updates.printerWidth;
  if (updates.enableWA !== undefined) payload.enable_wa = updates.enableWA;
  if (updates.enableNotifications !== undefined) payload.enable_notifications = updates.enableNotifications;

  const { error } = await supabase.from("settings").update(payload).eq("id", settingsId);
  if (error) throw error;
}

// ==========================================
// USERS CRUD
// ==========================================
export async function getUsers() {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  return (data || []).map((row) => mapUser(row as UserRow));
}

export async function createUserDB(user: Omit<AppUser, "id">) {
  const { data, error } = await supabase.from("users").insert(toUserRow(user)).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function updateUserDB(id: string, updates: Partial<AppUser>) {
  const payload: Partial<UserRow> = {};
  if (updates.username !== undefined) payload.username = updates.username;
  if (updates.passwordHash !== undefined) payload.password_hash = updates.passwordHash;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email || null;
  if (updates.phone !== undefined) payload.phone = updates.phone || null;
  if (updates.position !== undefined) payload.position = updates.position || null;
  if (updates.avatar !== undefined) payload.avatar = updates.avatar || null;
  if (updates.isActive !== undefined) payload.is_active = updates.isActive;

  const { error } = await supabase.from("users").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteUserDB(id: string) {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw error;
}
