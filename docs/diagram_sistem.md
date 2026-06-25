# Diagram Sistem (UML) ServisKu

Berikut adalah arsitektur logika dan alur sistem untuk memudahkan pemahaman teknis di masa depan.

## 1. Use Case Diagram
Diagram ini memetakan aktor (Admin/Pemilik) dan fitur-fitur yang bisa mereka akses dalam sistem.

```mermaid
usecaseDiagram
    actor Admin
    
    rectangle "Aplikasi ServisKu" {
        usecase "Login Sistem" as UC1
        usecase "Pantau Dashboard" as UC2
        usecase "Kelola Order Servis" as UC3
        usecase "Cetak Struk/Nota" as UC4
        usecase "Hubungi Pelanggan via WA" as UC5
        usecase "Kelola Stok & Sparepart" as UC6
        usecase "Mutasi Barang (Masuk/Keluar)" as UC7
        usecase "Lihat & Cetak Laporan" as UC8
        usecase "Kelola Pengaturan Toko" as UC9
    }
    
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    
    UC4 ..> UC3 : extends
    UC5 ..> UC3 : extends
    UC7 ..> UC6 : extends
```

---

## 2. Activity Diagram: Alur Order Servis
Diagram ini menjelaskan *flow* dari pelanggan datang membawa perangkat rusak hingga selesai.

```mermaid
stateDiagram-v2
    [*] --> BuatOrderBaru: Pelanggan Datang
    BuatOrderBaru --> ANTRIAN: Masukkan Data & Keluhan
    
    state "Proses Diagnosa" as Diagnosa {
        ANTRIAN --> PROSES: Teknisi Mengecek
        PROSES --> UpdateBiayaJasa: Tentukan Biaya Jasa
    }
    
    state "Pengerjaan" as Kerja {
        UpdateBiayaJasa --> ButuhSparepart?
        ButuhSparepart? --> TambahSparepart: Ya
        TambahSparepart --> PotongStokOtomatis
        PotongStokOtomatis --> MENUNGGU_PART: Part Belum Ada / Diorder
        MENUNGGU_PART --> PROSES: Part Datang & Dipasang
        ButuhSparepart? --> PROSES: Tidak (Hanya Jasa)
    }
    
    PROSES --> SIAP_DIAMBIL: Servis Selesai & Lulus QC
    SIAP_DIAMBIL --> HubungiWA: Beri Tahu Pelanggan
    HubungiWA --> SELESAI: Pelanggan Ambil & Bayar
    SELESAI --> CetakStruk
    CetakStruk --> [*]
    
    PROSES --> BATAL: Servis Tidak Sanggup/Batal
    BATAL --> [*]
```

---

## 3. Entity Relationship Diagram (ERD) / Data Model
Struktur relasi data dalam Store / Database.

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : "memiliki"
    CUSTOMER {
        string id PK
        string nama
        string noHp
        string alamat
        number totalServis
        date terakhirServis
    }

    TECHNICIAN ||--o{ ORDER : "menangani"
    TECHNICIAN {
        string id PK
        string name
        string avatar
        number rating
        number jobs
        boolean active
    }

    ORDER {
        string id PK
        string noServis
        string pelangganId FK
        string teknisiId FK
        string jenisPerangkat
        string keluhan
        number estimasiBiaya
        number biayaJasa
        string status
        date tanggalMasuk
    }

    ORDER ||--o{ ORDER_SPAREPART : "menggunakan"
    ORDER_SPAREPART {
        string orderId FK
        string sparepartId FK
        number qty
    }

    SPAREPART ||--o{ ORDER_SPAREPART : "dibeli dalam"
    SPAREPART ||--o{ MUTASI_STOK : "dicatat di"
    SPAREPART {
        string id PK
        string nama
        string kategori
        number stok
        number minStok
        number hargaModal
        number hargaJual
    }

    MUTASI_STOK {
        string id PK
        string sparepartId FK
        string tipe "IN/OUT"
        number qty
        number hargaBeli
        date tanggal
    }
```
