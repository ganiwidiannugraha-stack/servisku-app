-- ==============================================================================
-- DATABASE SCHEMA SETUP SCRIPT FOR SERVISKU
-- ==============================================================================
-- Instruksi:
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Buat query baru, paste seluruh isi file ini
-- 3. Klik "Run"
-- ==============================================================================

-- 1. CLEANUP (Opsional - Hapus tabel lama jika ada, hati-hati jika ada data penting!)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS mutasi_stok CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS spareparts CASCADE;
DROP TABLE IF EXISTS technicians CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. CREATE ENUMS
-- Supabase menggunakan tipe teks biasa untuk enum di versi ini agar lebih fleksibel dengan frontend,
-- tapi kita bisa menambahkan check constraint.

-- 3. CREATE TABLES

-- Tabel Users (Migrasi ke Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- Terhubung dengan auth.users() dari Supabase Auth
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'FRONTLINE', 'FINANCE', 'INVENTORY', 'TEKNISI')),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    position TEXT,
    avatar TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    no_hp TEXT NOT NULL,
    email TEXT,
    alamat TEXT,
    total_servis INTEGER DEFAULT 0 NOT NULL,
    terakhir_servis TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel Spareparts
CREATE TABLE spareparts (
    id TEXT PRIMARY KEY, -- Menggunakan ID manual seperti 'RAM-KIN-8GB-DDR4' dari mockData
    nama TEXT NOT NULL,
    kategori TEXT NOT NULL,
    merek TEXT,
    rak TEXT,
    stok INTEGER DEFAULT 0 NOT NULL,
    min_stok INTEGER DEFAULT 5 NOT NULL,
    harga_modal INTEGER NOT NULL,
    harga INTEGER NOT NULL, -- Harga jual
    pajak INTEGER DEFAULT 11 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel Technicians
CREATE TABLE technicians (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    rating NUMERIC(3, 1) DEFAULT 0.0 NOT NULL,
    jobs INTEGER DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_servis TEXT UNIQUE NOT NULL,
    pelanggan_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    teknisi_id TEXT REFERENCES technicians(id) ON DELETE SET NULL,
    jenis_perangkat TEXT NOT NULL,
    merk_model TEXT,
    no_seri TEXT,
    kelengkapan TEXT[],
    keluhan TEXT NOT NULL,
    pemeriksaan_awal TEXT,
    hasil_diagnosa TEXT,
    estimasi_biaya INTEGER,
    biaya_jasa INTEGER,
    -- Simpan detail sparepart sebagai JSONB
    spareparts JSONB DEFAULT '[]'::jsonb NOT NULL,
    -- Simpan detail jasa custom sebagai JSONB
    jasa JSONB DEFAULT '[]'::jsonb NOT NULL,
    -- Log Riwayat Perubahan Status
    history JSONB DEFAULT '[]'::jsonb NOT NULL,
    catatan_internal TEXT,
    prioritas TEXT,
    status TEXT NOT NULL CHECK (
        status IN (
            'MASUK',
            'DIAGNOSA',
            'MENUNGGU_KONFIRMASI',
            'PROSES',
            'MENUNGGU_SPAREPART',
            'SELESAI',
            'SIAP_DIAMBIL',
            'BATAL',
            'BATAL_SIAP_DIAMBIL',
            'BATAL_DIAMBIL',
            'DIAMBIL'
        )
    ),
    tanggal_masuk TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    estimasi_selesai TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel Mutasi Stok (Log pergerakan barang)
CREATE TABLE mutasi_stok (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sparepart_id TEXT NOT NULL REFERENCES spareparts(id) ON DELETE CASCADE,
    jenis TEXT NOT NULL CHECK (jenis IN ('MASUK', 'KELUAR')),
    jumlah INTEGER NOT NULL,
    keterangan TEXT,
    tanggal TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel Settings (Konfigurasi Aplikasi)
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_name TEXT NOT NULL,
    owner_name TEXT,
    address TEXT,
    phone TEXT,
    printer_width TEXT DEFAULT '58mm' NOT NULL,
    enable_wa BOOLEAN DEFAULT true NOT NULL,
    enable_notifications BOOLEAN DEFAULT true NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel Audit Logs (Catatan aktivitas)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 4. CREATE INDEXES (Untuk mempercepat query)
CREATE INDEX idx_orders_pelanggan_id ON orders(pelanggan_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_mutasi_stok_sparepart_id ON mutasi_stok(sparepart_id);
CREATE INDEX idx_mutasi_stok_tanggal ON mutasi_stok(tanggal);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- CATATAN PENTING: Saat ini RLS dimatikan (false) agar integrasi dari frontend mudah untuk demo.
-- Jika sudah masuk production dengan Supabase Auth, ubah 'ENABLE ROW LEVEL SECURITY'
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE spareparts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutasi_stok ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Buat policy restrict (hanya bisa diakses kalau sudah login lewat Supabase Auth)
CREATE POLICY "Authenticated users access customers" ON customers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users access spareparts" ON spareparts FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users access orders" ON orders FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users access mutasi_stok" ON mutasi_stok FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users access technicians" ON technicians FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users access settings" ON settings FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users access users" ON users FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users access audit_logs" ON audit_logs FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. SEED DATA AWAL (Default)

-- Insert Teknisi
INSERT INTO technicians (id, name, avatar, rating, jobs, active) VALUES
('t1', 'Deni Setiawan', 'D', 4.9, 52, true),
('t2', 'Rina Amelia', 'R', 4.7, 48, true),
('t3', 'Hendra Kusuma', 'H', 4.8, 48, true);

-- Insert Spareparts (Sesuai ID manual di mockData)
INSERT INTO spareparts (id, nama, kategori, merek, rak, stok, min_stok, harga_modal, harga, pajak) VALUES
('RAM-KIN-8GB-DDR4', 'RAM DDR4 8GB 3200MHz', 'RAM', 'Kingston', 'Rak C-1', 12, 5, 350000, 450000, 11),
('RAM-COR-16GB-DDR4', 'RAM DDR4 4GB 2666MHz', 'RAM', 'Samsung', 'Rak C-2', 3, 5, 180000, 250000, 11),
('SSD-WD-256-SATA', 'SSD SATA 256GB', 'HDD/SSD', 'WD Green', 'Rak D-1', 8, 5, 220000, 320000, 11),
('SSD-SAM-512-NVME', 'SSD NVMe 512GB', 'HDD/SSD', 'Samsung', 'Rak D-2', 15, 5, 450000, 600000, 11),
('HDD-SEA-1TB-BAR', 'HDD 1TB Seagate', 'HDD/SSD', 'Seagate', 'Rak E-1', 4, 3, 550000, 700000, 11),
('KBD-ASUS-X441', 'Keyboard Laptop Asus X441', 'Keyboard', 'Asus', 'Rak I-1', 2, 2, 80000, 150000, 11),
('KBD-LEN-IP110', 'Keyboard Laptop Lenovo IdeaPad', 'Keyboard', 'Lenovo', 'Rak I-1', 5, 2, 90000, 175000, 11),
('LCD-LED-14-30P', 'Baterai Asus X453', 'Baterai', 'Asus', 'Rak J-1', 1, 2, 180000, 300000, 11),
('BAT-ACE-AS3', 'Baterai Acer Aspire', 'Baterai', 'Acer', 'Rak J-1', 4, 2, 190000, 320000, 11),
('BAT-ASU-X441', 'Thermal Paste GD900', 'Lainnya', 'GD', 'Rak H-2', 20, 10, 15000, 35000, 11),
('CPU-INT-I5104', 'Thermal Paste Grizzly', 'Lainnya', 'Thermal Grizzly', 'Rak H-2', 8, 5, 120000, 180000, 11),
('FAN-NOC-120MM', 'LCD LED 14.0 Slim 30 Pin', 'Layar', 'LG', 'Rak K-1', 3, 2, 550000, 750000, 11),
('PSU-COR-550W-BRZ', 'Tinta Epson 003 Hitam', 'Tinta', 'Epson', 'Rak L-1', 15, 5, 75000, 110000, 11),
('GPU-NVD-GTX1650', 'PSU 500W 80+ Bronze', 'PSU', 'Corsair', 'Rak G-1', 5, 2, 450000, 650000, 11),
('MB-GIG-H410M', 'Motherboard H410M', 'Motherboard', 'MSI', 'Rak B-1', 2, 2, 800000, 1100000, 11);

-- Insert Default Settings
INSERT INTO settings (shop_name, owner_name, address, phone, printer_width, enable_wa, enable_notifications) VALUES
('ServisKu Repair', 'Pak Teten', 'Jl. Teknologi No. 123, Jakarta', '081234567890', '58mm', true, true);

-- Insert Default Users (Tanpa auth_id sementara, script JS yang akan mendaftarkannya)
INSERT INTO users (username, role, name, position, avatar) VALUES
('owner', 'OWNER', 'Pak Teten', 'Pemilik Bengkel', 'P'),
('sari', 'FRONTLINE', 'Sari Kustina', 'Kasir Depan', 'S'),
('deni', 'TEKNISI', 'Deni Setiawan', 'Teknisi Utama', 'D'),
('rina', 'TEKNISI', 'Rina Amelia', 'Teknisi Junior', 'R'),
('hendra', 'TEKNISI', 'Hendra Kusuma', 'Teknisi Senior', 'H'),
('agus', 'INVENTORY', 'Agus Pratama', 'Admin Gudang', 'A'),
('budi', 'FINANCE', 'Budi Santoso', 'Staf Keuangan', 'B');

-- Selesai!
