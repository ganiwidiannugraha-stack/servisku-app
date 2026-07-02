const fs = require('fs');
const { v4: uuidv4 } = require('crypto');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - randInt(0, daysBack));
  date.setHours(randInt(8, 17), randInt(0, 59), randInt(0, 59));
  return date;
}

const customers = [];
const customerNames = ['Fauzan Akbar', 'Kevin Wijaya', 'Sisca Kohl', 'Michelle Ziudith', 'Rio Haryanto', 'Chicco Jerikho', 'Putri Tanjung', 'Gading Marten', 'Anya Geraldine', 'Iqbaal Ramadhan', 'Chef Juna', 'Boy William', 'Tara Basro', 'Raditya Dika', 'Vanesha Prescilla', 'Jefri Nichol', 'Maudy Ayunda', 'Agnez Mo', 'Raisa Andriana', 'Isyana Sarasvati', 'Tulus', 'Afgan', 'Vidi Aldiano'];

for (let i = 1; i <= 18; i++) {
  customers.push({
    id: uuid(),
    nama: rand(customerNames),
    no_hp: `08${randInt(100000000, 999999999)}`,
    email: `customer${i}@example.com`,
    alamat: `Jl. Merdeka No. ${i}, Jakarta`,
    total_servis: randInt(1, 5)
  });
}

const sparepartsData = [
  { k: 'RAM', m: 'Kingston', n: 'RAM Kingston Fury DDR4 8GB 3200MHz', h: 350000 },
  { k: 'RAM', m: 'Corsair', n: 'RAM Corsair Vengeance DDR4 16GB', h: 700000 },
  { k: 'RAM', m: 'Samsung', n: 'RAM Samsung SODIMM DDR4 4GB', h: 250000 },
  { k: 'Penyimpanan', m: 'Samsung', n: 'SSD Samsung 870 EVO 500GB SATA', h: 750000 },
  { k: 'Penyimpanan', m: 'WD', n: 'SSD NVMe WD Blue SN570 500GB', h: 680000 },
  { k: 'Penyimpanan', m: 'Seagate', n: 'HDD Seagate Barracuda 1TB', h: 600000 },
  { k: 'Baterai', m: 'Asus', n: 'Baterai Laptop Asus X453M', h: 250000 },
  { k: 'Baterai', m: 'Acer', n: 'Baterai Acer Aspire E1-471', h: 230000 },
  { k: 'Baterai', m: 'Lenovo', n: 'Baterai Lenovo ThinkPad T470', h: 450000 },
  { k: 'Keyboard', m: 'Lenovo', n: 'Keyboard Lenovo ThinkPad T470', h: 300000 },
  { k: 'Keyboard', m: 'Asus', n: 'Keyboard Asus VivoBook A412', h: 200000 },
  { k: 'Layar', m: 'Generic', n: 'Layar LCD LED 14.0 Slim 30 Pin', h: 550000 },
  { k: 'Layar', m: 'Generic', n: 'Layar LCD LED 15.6 Slim 40 Pin', h: 750000 },
  { k: 'Motherboard', m: 'Asus', n: 'Motherboard Asus H410M-E', h: 950000 },
  { k: 'Motherboard', m: 'Gigabyte', n: 'Motherboard Gigabyte B450M DS3H', h: 1100000 },
  { k: 'CPU', m: 'Intel', n: 'Prosesor Intel Core i3-10100F', h: 1200000 },
  { k: 'CPU', m: 'AMD', n: 'Prosesor AMD Ryzen 5 5600G', h: 2100000 },
  { k: 'VGA', m: 'Nvidia', n: 'VGA Nvidia GTX 1650 4GB', h: 2500000 },
  { k: 'VGA', m: 'AMD', n: 'VGA AMD Radeon RX 6600 8GB', h: 3200000 },
  { k: 'Lainnya', m: 'Corsair', n: 'Power Supply Corsair CV550 550W', h: 750000 },
  { k: 'Lainnya', m: 'DeepCool', n: 'Thermal Paste DeepCool Z5', h: 65000 },
  { k: 'Tinta', m: 'Epson', n: 'Tinta Epson 003 Black (Original)', h: 85000 },
  { k: 'Tinta', m: 'Canon', n: 'Tinta Canon PG-47 Black', h: 120000 },
  { k: 'Tinta', m: 'HP', n: 'Cartridge HP 680 Color', h: 140000 },
  { k: 'Lainnya', m: 'Generic', n: 'Baterai CMOS CR2032', h: 5000 },
  { k: 'Lainnya', m: 'Generic', n: 'Kabel SATA 3.0 6Gbps', h: 15000 },
  { k: 'Lainnya', m: 'Asus', n: 'Kabel Fleksibel Touchpad Asus', h: 45000 },
  { k: 'Lainnya', m: 'Intel', n: 'Kipas (Fan) Prosesor Intel LGA 1151', h: 85000 },
  { k: 'Lainnya', m: 'Generic', n: 'IC Power Laptop BQ24780S', h: 35000 },
  { k: 'Lainnya', m: 'Lenovo', n: 'Jack DC Power Laptop Lenovo', h: 25000 }
];

const spareparts = [];
const mutasiStokList = [];

for (let i = 0; i < sparepartsData.length; i++) {
  const data = sparepartsData[i];
  const code = `${data.k.substring(0, 3).toUpperCase()}-${data.m.substring(0, 3).toUpperCase()}-${randInt(1000, 9999)}`;
  const stokAwal = randInt(10, 50);
  
  spareparts.push({
    id: code,
    nama: data.n,
    kategori: data.k,
    merek: data.m,
    rak: `Rak ${String.fromCharCode(65 + randInt(0, 5))}-${randInt(1, 5)}`,
    stok: stokAwal, // We will deduct this later when orders use them
    min_stok: 5,
    harga_modal: data.h,
    harga: Math.floor(data.h * 1.3),
    pajak: 11
  });

  // Mutasi Stok Awal
  mutasiStokList.push({
    id: uuid(),
    sparepart_id: code,
    jenis: 'MASUK',
    jumlah: stokAwal,
    keterangan: 'Stok Awal Sistem',
    tanggal: getRandomDate(90).toISOString()
  });
}

const orders = [];
const statusList = ['MASUK', 'DIAGNOSA', 'MENUNGGU_KONFIRMASI', 'PROSES', 'MENUNGGU_SPAREPART', 'SELESAI', 'DIAMBIL', 'BATAL'];

// Generate orders sorted by date to simulate real progression
const orderDates = [];
for(let i=0; i<25; i++) {
  orderDates.push(getRandomDate(90));
}
orderDates.sort((a,b) => a - b); // ascending

for (let i = 0; i < 25; i++) {
  const cust = rand(customers);
  const tech = `t${randInt(1, 2)}`;
  const usedSpareparts = [];
  const numSp = randInt(0, 2);
  let estimasiBiaya = 0;
  const tglMasuk = orderDates[i];
  
  for (let j = 0; j < numSp; j++) {
    const spIdx = randInt(0, spareparts.length - 1);
    const sp = spareparts[spIdx];
    const qty = randInt(1, 2);
    
    // deduct stock directly
    sp.stok -= qty;
    
    usedSpareparts.push({
      id: sp.id,
      nama: sp.nama,
      harga: sp.harga,
      qty: qty
    });
    
    estimasiBiaya += (sp.harga * qty);
    
    // Create mutation OUT
    mutasiStokList.push({
      id: uuid(),
      sparepart_id: sp.id,
      jenis: 'KELUAR',
      jumlah: qty,
      keterangan: `Dipakai untuk Servis #SRV-2026-${(i + 1).toString().padStart(4, '0')}`,
      tanggal: new Date(tglMasuk.getTime() + randInt(1,48)*60*60*1000).toISOString() // 1-48 hours after order
    });
  }
  
  const biayaJasa = randInt(10, 50) * 10000;
  estimasiBiaya += biayaJasa;
  
  orders.push({
    id: uuid(),
    no_servis: `SRV-2026-${(i + 1).toString().padStart(4, '0')}`,
    pelanggan_id: cust.id,
    teknisi_id: tech,
    jenis_perangkat: rand(['Laptop', 'PC', 'Printer', 'Monitor', 'Proyektor']),
    merk_model: `${rand(['Asus', 'Acer', 'Lenovo', 'HP', 'Dell', 'MSI', 'Apple'])} Model ${randInt(1, 100)}`,
    keluhan: rand(['Mati total', 'Layar blank', 'Keyboard error', 'Baterai drop', 'Overheat', 'Kena air', 'Tidak bisa booting', 'Blue screen', 'Tinta tidak keluar', 'Suara berisik']),
    pemeriksaan_awal: 'Sedang dicek',
    hasil_diagnosa: 'Kerusakan pada komponen',
    estimasi_biaya: estimasiBiaya,
    biaya_jasa: biayaJasa,
    spareparts: JSON.stringify(usedSpareparts),
    status: rand(statusList),
    tanggal_masuk: tglMasuk.toISOString()
  });
}

let sql = `-- Hapus data lama agar tidak bentrok\n`;
sql += `TRUNCATE TABLE orders, mutasi_stok, spareparts, customers CASCADE;\n\n`;

sql += `-- INSERT CUSTOMERS\n`;
sql += `INSERT INTO customers (id, nama, no_hp, email, alamat, total_servis) VALUES\n`;
sql += customers.map(c => `('${c.id}', '${c.nama}', '${c.no_hp}', '${c.email}', '${c.alamat}', ${c.total_servis})`).join(',\n') + ';\n\n';

sql += `-- INSERT SPAREPARTS\n`;
sql += `INSERT INTO spareparts (id, nama, kategori, merek, rak, stok, min_stok, harga_modal, harga, pajak) VALUES\n`;
sql += spareparts.map(s => `('${s.id}', '${s.nama}', '${s.kategori}', '${s.merek}', '${s.rak}', ${s.stok}, ${s.min_stok}, ${s.harga_modal}, ${s.harga}, ${s.pajak})`).join(',\n') + ';\n\n';

sql += `-- INSERT ORDERS\n`;
sql += `INSERT INTO orders (id, no_servis, pelanggan_id, teknisi_id, jenis_perangkat, merk_model, keluhan, pemeriksaan_awal, hasil_diagnosa, estimasi_biaya, biaya_jasa, spareparts, status, tanggal_masuk) VALUES\n`;
sql += orders.map(o => `('${o.id}', '${o.no_servis}', '${o.pelanggan_id}', '${o.teknisi_id}', '${o.jenis_perangkat}', '${o.merk_model}', '${o.keluhan}', '${o.pemeriksaan_awal}', '${o.hasil_diagnosa}', ${o.estimasi_biaya}, ${o.biaya_jasa}, '${o.spareparts}', '${o.status}', '${o.tanggal_masuk}')`).join(',\n') + ';\n\n';

sql += `-- INSERT MUTASI STOK\n`;
sql += `INSERT INTO mutasi_stok (id, sparepart_id, jenis, jumlah, keterangan, tanggal) VALUES\n`;
sql += mutasiStokList.map(m => `('${m.id}', '${m.sparepart_id}', '${m.jenis}', ${m.jumlah}, '${m.keterangan}', '${m.tanggal}')`).join(',\n') + ';\n\n';

fs.writeFileSync('seed_data_large.sql', sql);
console.log('Successfully created seed_data_large.sql');
