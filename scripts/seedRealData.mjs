import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { resolve } from "path";
import crypto from "crypto";

dotenv.config({ path: resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomEl = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seedCustomers() {
  console.log("Seeding 18 Customers...");
  const firstNames = ["Budi", "Andi", "Siti", "Dewi", "Reza", "Fajar", "Ayu", "Putri", "Hendra", "Gilang", "Rina", "Dian", "Eko", "Bagus", "Tari", "Lestari", "Wahyu", "Rizky"];
  const lastNames = ["Santoso", "Wijaya", "Kurniawan", "Setiawan", "Pratama", "Sari", "Lestari", "Nugroho", "Saputra", "Wahyuni"];
  
  const customers = [];
  for (let i = 0; i < 18; i++) {
    customers.push({
      id: crypto.randomUUID(),
      nama: `${firstNames[i]} ${randomEl(lastNames)}`,
      no_hp: `08${randomInt(1000000000, 9999999999)}`,
      alamat: `Jl. Merdeka No. ${randomInt(1, 100)}, Jakarta`,
      total_servis: 0,
      terakhir_servis: new Date().toISOString()
    });
  }

  const { data, error } = await supabase.from("customers").insert(customers).select();
  if (error) throw error;
  return data;
}

async function seedSpareparts() {
  console.log("Seeding 50 Spareparts...");
  const categories = ["LCD", "Baterai", "RAM", "SSD", "Keyboard", "IC", "Adaptor", "Lainnya"];
  const merekList = ["Asus", "Acer", "Lenovo", "HP", "Dell", "Apple", "Samsung", "Epson", "Canon"];
  
  const spareparts = [];
  for (let i = 1; i <= 50; i++) {
    const isCritical = Math.random() > 0.8;
    const stok = isCritical ? randomInt(0, 2) : randomInt(5, 50);
    const min_stok = randomInt(3, 5);
    const harga_modal = randomInt(5, 50) * 10000;
    const margin = randomInt(20, 50) / 100;
    const harga_jual = Math.round(harga_modal * (1 + margin));

    const category = randomEl(categories);
    const merek = randomEl(merekList);
    
    spareparts.push({
      id: crypto.randomUUID(),
      nama: `${category} ${merek} - Tipe ${i}`,
      kategori: category,
      stok: stok,
      min_stok: min_stok,
      harga_modal: harga_modal,
      harga: harga_jual,
      pajak: 0
    });
  }

  const { data, error } = await supabase.from("spareparts").insert(spareparts).select();
  if (error) throw error;
  return data;
}

async function seedOrders(customers, spareparts) {
  console.log("Seeding 25 Orders...");
  const devices = ["Laptop", "PC Desktop", "Printer", "Lainnya"];
  const statuses = ["MASUK", "PROSES", "MENUNGGU_PART", "SELESAI", "DIAMBIL", "BATAL"];
  
  const { data: technicians } = await supabase.from("technicians").select("*");
  const techIds = technicians && technicians.length > 0 ? technicians.map(t => t.id) : [null];

  const orders = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  for (let i = 1; i <= 25; i++) {
    const dateMasuk = randomDate(threeMonthsAgo, now);
    const isDone = Math.random() > 0.3;
    const status = isDone ? (Math.random() > 0.5 ? "SELESAI" : "DIAMBIL") : randomEl(["MASUK", "PROSES", "MENUNGGU_PART", "BATAL"]);
    
    const estimasi_biaya = randomInt(10, 100) * 10000;
    
    orders.push({
      id: crypto.randomUUID(),
      no_servis: `SRV-${new Date(dateMasuk).getFullYear()}${String(new Date(dateMasuk).getMonth()+1).padStart(2,"0")}-${String(i).padStart(4,"0")}`,
      pelanggan_id: randomEl(customers).id,
      jenis_perangkat: randomEl(devices),
      keluhan: "Mati total / Layar blank / Lemot",
      estimasi_biaya: estimasi_biaya,
      biaya_jasa: status === "SELESAI" || status === "DIAMBIL" ? Math.round(estimasi_biaya * 0.4) : null,
      status: status,
      tanggal_masuk: dateMasuk,
      teknisi_id: status !== "MASUK" ? randomEl(techIds) : null
    });
  }

  const { data, error } = await supabase.from("orders").insert(orders).select();
  if (error) throw error;
  return data;
}

async function run() {
  try {
    const customers = await seedCustomers();
    const spareparts = await seedSpareparts();
    await seedOrders(customers, spareparts);
    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

run();

