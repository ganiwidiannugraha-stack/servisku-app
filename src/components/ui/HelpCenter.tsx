import React, { useState } from 'react';
import { Modal } from './Modal';
import { FileText, Wrench, Package } from 'lucide-react';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'FRONTLINE' | 'TEKNISI' | 'INVENTORY'>('FRONTLINE');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pusat Bantuan & Panduan"
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-48 shrink-0 flex flex-col gap-1 border-r border-gray-100 pr-4">
          <button
            onClick={() => setActiveTab('FRONTLINE')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'FRONTLINE' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FileText size={18} /> Frontline / Kasir
          </button>
          <button
            onClick={() => setActiveTab('TEKNISI')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'TEKNISI' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Wrench size={18} /> Teknisi
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'INVENTORY' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Package size={18} /> Stok & Gudang
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 max-h-[60vh] overflow-y-auto pr-2">
          {activeTab === 'FRONTLINE' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Panduan Penerimaan Servis</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>1. <strong>Terima Perangkat:</strong> Buka menu <em>Order Baru</em>, isi data pelanggan dan keluhan perangkat. Jika pelanggan lama, cukup ketik nama/nomor HP.</p>
                <p>2. <strong>Jalan Pintas:</strong> Anda bisa menekan tombol <strong>Ctrl + S</strong> di keyboard untuk langsung menyimpan data penerimaan baru.</p>
                <p>3. <strong>Tanda Terima:</strong> Setelah order disimpan, klik <em>Cetak Tanda Terima</em> untuk diberikan kepada pelanggan.</p>
                <p>4. <strong>Pembayaran:</strong> Saat pelanggan mengambil barang, buka menu <em>Pembayaran</em>, masukkan nominal yang dibayar, dan klik Selesaikan Pembayaran.</p>
              </div>
            </div>
          )}

          {activeTab === 'TEKNISI' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Panduan Pengerjaan Servis</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>1. <strong>Ambil Pekerjaan:</strong> Buka menu <em>Dashboard</em> atau <em>Daftar Order</em>. Cari order berstatus MASUK, lalu klik <strong>Ambil Pekerjaan</strong>.</p>
                <p>2. <strong>Diagnosa & Sparepart:</strong> Klik <em>Update Status</em> untuk mencatat kerusakan. Jika butuh komponen baru, masuk ke tab <em>Sparepart</em> dan tambahkan ke dalam order.</p>
                <p>3. <strong>Penyelesaian:</strong> Setelah perangkat selesai diperbaiki, ubah status menjadi <strong>SELESAI</strong>. Notifikasi WA otomatis akan terkirim (jika diaktifkan).</p>
                <p>4. <strong>Undo (Batal):</strong> Jika Anda salah menekan tombol status, tekan tombol <strong>Undo</strong> pada notifikasi hijau yang muncul di atas layar (berlaku 5 detik).</p>
              </div>
            </div>
          )}

          {activeTab === 'INVENTORY' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Panduan Manajemen Stok Gudang</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>1. <strong>Tambah Stok Baru:</strong> Buka menu <em>Stok Gudang</em>, klik <em>Tambah Sparepart</em>. Isikan Modal dan Harga Jual (termasuk pajak).</p>
                <p>2. <strong>Stok Menipis:</strong> Sistem akan otomatis memunculkan tanda peringatan merah jika sisa stok berada di bawah <em>Batas Minimum</em> yang Anda tentukan.</p>
                <p>3. <strong>Pengembalian Stok (Retur):</strong> Jika order dibatalkan (BATAL), semua sparepart yang terlanjur dimasukkan ke dalam order tersebut akan <strong>otomatis dikembalikan</strong> ke gudang secara sistem.</p>
                <p>4. <strong>Hapus Barang:</strong> Jika barang rusak atau hilang, lakukan secara hati-hati melalui tombol Hapus (Anda akan diminta konfirmasi ulang).</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
