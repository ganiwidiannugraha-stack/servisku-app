const fs = require('fs');

const { v4: uuidv4 } = require('crypto');
// We don't have uuidv4 natively in Node without npm install, but we can generate valid v4 UUIDs easily
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

const customers = [];
for(let i=1; i<=18; i++) {
  customers.push({
    id: uuid(),
    nama: rand(['Fauzan Akbar', 'Kevin Wijaya', 'Sisca Kohl', 'Michelle Ziudith', 'Rio Haryanto', 'Chicco Jerikho', 'Putri Tanjung', 'Gading Marten', 'Anya Geraldine', 'Iqbaal Ramadhan', 'Chef Juna', 'Boy William', 'Tara Basro', 'Raditya Dika', 'Vanesha Prescilla', 'Jefri Nichol', 'Maudy Ayunda', 'Agnez Mo', 'Raisa Andriana', 'Isyana Sarasvati', 'Tulus', 'Afgan', 'Vidi Aldiano']),
    no_hp: `08${randInt(100000000, 999999999)}`,
    email: `customer${i}@example.com`,
    alamat: `Jl. Merdeka No. ${i}, Jakarta`,
    total_servis: randInt(1, 5)
  });
}

const spareparts = [];
const brands = ['Asus', 'Acer', 'Lenovo', 'HP', 'Dell', 'MSI', 'Apple', 'Samsung', 'Kingston', 'Corsair', 'WD', 'Seagate', 'Intel', 'AMD'];
const categories = ['Keyboard', 'Baterai', 'Layar', 'RAM', 'Penyimpanan', 'Motherboard', 'CPU', 'VGA', 'Tinta', 'Lainnya'];

for(let i=1; i<=60; i++) {
  const cat = rand(categories);
  const brand = rand(brands);
  const code = `${cat.substring(0,3).toUpperCase()}-${brand.substring(0,3).toUpperCase()}-${randInt(1000,9999)}`;
  const modal = randInt(5, 50) * 10000;
  const jual = Math.floor(modal * 1.3);
  spareparts.push({
    id: code,
    nama: `${cat} ${brand} Seri ${i}`,
    kategori: cat,
    merek: brand,
    rak: `Rak ${String.fromCharCode(65 + randInt(0,5))}-${randInt(1,5)}`,
    stok: randInt(5, 30),
    min_stok: 5,
    harga_modal: modal,
    harga: jual,
    pajak: 11
  });
}

const orders = [];
const statusList = ['MASUK', 'DIAGNOSA', 'MENUNGGU_KONFIRMASI', 'PROSES', 'MENUNGGU_SPAREPART', 'SELESAI', 'DIAMBIL', 'BATAL'];

for(let i=1; i<=25; i++) {
  const cust = rand(customers);
  const tech = `t${randInt(1,2)}`;
  const usedSpareparts = [];
  const numSp = randInt(0, 2);
  let estimasiBiaya = 0;
  
  for(let j=0; j<numSp; j++) {
    const sp = rand(spareparts);
    const qty = randInt(1, 2);
    usedSpareparts.push({
      id: sp.id,
      nama: sp.nama,
      harga: sp.harga,
      qty: qty
    });
    estimasiBiaya += (sp.harga * qty);
  }
  
  const biayaJasa = randInt(10, 50) * 10000;
  estimasiBiaya += biayaJasa;
  
  orders.push({
    id: uuid(),
    no_servis: `SRV-2026-${i.toString().padStart(4, '0')}`,
    pelanggan_id: cust.id,
    teknisi_id: tech,
    jenis_perangkat: rand(['Laptop', 'PC', 'Printer', 'Monitor', 'Proyektor']),
    merk_model: `${rand(brands)} Model ${randInt(1,100)}`,
    keluhan: rand(['Mati total', 'Layar blank', 'Keyboard error', 'Baterai drop', 'Overheat', 'Kena air', 'Tidak bisa booting', 'Blue screen', 'Tinta tidak keluar', 'Suara berisik']),
    pemeriksaan_awal: 'Sedang dicek',
    hasil_diagnosa: 'Kerusakan pada komponen',
    estimasi_biaya: estimasiBiaya,
    biaya_jasa: biayaJasa,
    spareparts: JSON.stringify(usedSpareparts),
    status: rand(statusList)
  });
}

let sql = `-- INSERT CUSTOMERS\n`;
sql += `INSERT INTO customers (id, nama, no_hp, email, alamat, total_servis) VALUES\n`;
sql += customers.map(c => `('${c.id}', '${c.nama}', '${c.no_hp}', '${c.email}', '${c.alamat}', ${c.total_servis})`).join(',\n') + ';\n\n';

sql += `-- INSERT SPAREPARTS\n`;
sql += `INSERT INTO spareparts (id, nama, kategori, merek, rak, stok, min_stok, harga_modal, harga, pajak) VALUES\n`;
sql += spareparts.map(s => `('${s.id}', '${s.nama}', '${s.kategori}', '${s.merek}', '${s.rak}', ${s.stok}, ${s.min_stok}, ${s.harga_modal}, ${s.harga}, ${s.pajak})`).join(',\n') + ';\n\n';

sql += `-- INSERT ORDERS\n`;
sql += `INSERT INTO orders (id, no_servis, pelanggan_id, teknisi_id, jenis_perangkat, merk_model, keluhan, pemeriksaan_awal, hasil_diagnosa, estimasi_biaya, biaya_jasa, spareparts, status) VALUES\n`;
sql += orders.map(o => `('${o.id}', '${o.no_servis}', '${o.pelanggan_id}', '${o.teknisi_id}', '${o.jenis_perangkat}', '${o.merk_model}', '${o.keluhan}', '${o.pemeriksaan_awal}', '${o.hasil_diagnosa}', ${o.estimasi_biaya}, ${o.biaya_jasa}, '${o.spareparts}', '${o.status}')`).join(',\n') + ';\n\n';

fs.writeFileSync('seed_data_large.sql', sql);
console.log('Successfully created seed_data_large.sql');
