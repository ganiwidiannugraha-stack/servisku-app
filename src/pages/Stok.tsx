import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import type { Sparepart } from '../store';
import { Button } from '../components/ui/Button';
import { Plus, Search, Filter, AlertTriangle, Wallet, Calendar } from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';

export const Stok: React.FC = () => {
  const { spareparts, mutasiStok, addSparepart, tambahMutasiStok, userRole } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMutasiModalOpen, setIsMutasiModalOpen] = useState(false);
  const [mutasiType, setMutasiType] = useState<'IN' | 'OUT'>('IN');
  const [selectedSparepart, setSelectedSparepart] = useState<Sparepart | null>(null);
  const [activeTab, setActiveTab] = useState<'STOK' | 'RIWAYAT'>('STOK');

  const filteredSpareparts = (spareparts || []).filter(s => {
    const matchesSearch = (s.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.kategori || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKategori = kategoriFilter === 'ALL' || s.kategori === kategoriFilter;
    return matchesSearch && matchesKategori;
  });

  const paginatedSpareparts = filteredSpareparts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const totalPages = Math.ceil(filteredSpareparts.length / ITEMS_PER_PAGE);

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, kategoriFilter]);

  const totalNilaiStok = useMemo(() => {
    return (spareparts || []).reduce((sum, sp) => sum + (sp.stok * (sp.hargaModal || 0)), 0);
  }, [spareparts]);

  const itemsToRestock = useMemo(() => {
    return (spareparts || []).filter(sp => sp.stok <= (sp.minStok || 0)).length;
  }, [spareparts]);

  const handleOpenMutasiModal = (sparepart: Sparepart, tipe: 'IN' | 'OUT') => {
    setSelectedSparepart(sparepart);
    setMutasiType(tipe);
    setIsMutasiModalOpen(true);
  };

  return (
    <div className="p-8 w-full min-h-screen">
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Manajemen Stok' }]} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pusat Inventaris & Sparepart</h1>
          <p className="mt-1 text-gray-500 font-medium">Kelola ketersediaan barang dan riwayat mutasi.</p>
        </div>
        <div className="flex gap-3">
          {['OWNER', 'INVENTORY'].includes(userRole || '') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              Tambah Sparepart
            </button>
          )}
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-5 items-center shadow-sm">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm">Total Nilai Stok</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Rp {totalNilaiStok.toLocaleString('id-ID')}</h2>
            <p className="text-xs text-gray-400 mt-1">Total nilai semua stok saat ini</p>
          </div>
        </div>

        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 flex gap-5 items-center shadow-sm">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-gray-700 font-medium text-sm">Item Perlu Di-restock</p>
            <h2 className="text-3xl font-bold text-red-600 mt-1">{itemsToRestock} Item</h2>
            <p className="text-xs text-red-400 mt-1">Perlu di-restock segera</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={activeTab === 'STOK' ? "Cari nama, kategori atau SKU..." : "Cari nama barang..."}
            className="w-full py-2.5 pl-10 pr-4 text-sm font-medium border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm placeholder:font-normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          {activeTab === 'STOK' && (
            <div className="relative flex items-center border border-gray-200 rounded-xl shadow-sm bg-white">
              <Filter size={16} className="absolute left-3 text-gray-500" />
              <select 
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="py-2.5 pl-9 pr-8 text-sm font-medium bg-transparent focus:outline-none appearance-none"
              >
                <option value="ALL">Semua Kategori</option>
                {Array.from(new Set((spareparts || []).map(s => s.kategori))).filter(Boolean).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          )}
          
          {activeTab === 'RIWAYAT' && (
            <div className="relative hidden md:flex items-center border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
              <Calendar size={16} className="absolute left-3 text-gray-500 pointer-events-none" />
              <input 
                type="date"
                className="py-2.5 pl-9 pr-4 text-sm font-medium bg-transparent focus:outline-none w-full text-gray-600 cursor-pointer"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            className={`px-6 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'STOK' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('STOK')}
          >
            Daftar Stok
          </button>
          <button
            className={`px-6 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'RIWAYAT' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('RIWAYAT')}
          >
            Riwayat In/Out
          </button>
        </div>

        {activeTab === 'STOK' && (
          <div className="overflow-x-auto">
            <div className="px-6 py-4 bg-blue-50/50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Total Nilai Aset Gudang</p>
                <p className="text-xl font-bold text-blue-700 mt-1">Rp {totalNilaiStok.toLocaleString('id-ID')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase">Status Stok</p>
                {itemsToRestock > 0 ? (
                  <p className="text-sm font-bold text-red-600 mt-1">⚠️ {itemsToRestock} barang hampir habis</p>
                ) : (
                  <p className="text-sm font-bold text-emerald-600 mt-1">✨ Semua stok aman</p>
                )}
              </div>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 font-medium bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Nama Barang</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Merek</th>
                  <th className="px-6 py-4 text-right">Harga Modal</th>
                  <th className="px-6 py-4 text-right">Harga Jual</th>
                  <th className="px-6 py-4 text-center">Keuntungan</th>
                  <th className="px-6 py-4">Status Stok</th>
                  {['OWNER', 'INVENTORY'].includes(userRole || '') && <th className="px-6 py-4 text-center">Aksi Mutasi</th>}
                </tr>
              </thead>
              <tbody>
                {(paginatedSpareparts || []).map((item) => {
                  const isLowStock = item.stok <= (item.minStok || 0);
                  const modal = item.hargaModal || 0;
                  const harga = item.harga || 0;
                  const laba = harga - modal;
                  const margin = modal > 0 ? Math.round((laba / modal) * 100) : 0;
                  
                  return (
                    <tr key={item.id} className={`border-b border-gray-50 transition-colors ${isLowStock ? 'bg-red-50/30' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-6 py-5">
                        <span className="font-mono text-sm font-semibold text-gray-600 whitespace-nowrap">{item.id.toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900">{item.nama}</p>
                        {item.rak && <p className="text-xs text-gray-400 mt-0.5">Lokasi: {item.rak}</p>}
                      </td>
                      <td className="px-6 py-5 font-medium text-gray-600">{item.kategori}</td>
                      <td className="px-6 py-5 font-medium text-gray-600">{item.merek || '-'}</td>
                      <td className="px-6 py-5 text-right font-medium text-gray-600">
                        Rp {modal.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-5 text-right font-medium text-gray-900">
                        Rp {harga.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-bold text-green-600">{margin}%</span>
                        <span className="text-xs text-gray-500 ml-1">(Rp {laba.toLocaleString('id-ID')})</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5 w-40">
                          <div className="flex justify-between text-sm font-bold">
                            <span className={isLowStock ? 'text-red-600' : 'text-gray-900'}>{item.stok}/{(item.minStok || 0)*5}</span>
                            <span className="text-gray-400 font-medium">[{Math.min(100, Math.round((item.stok / ((item.minStok || 1)*5)) * 100))}%]</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isLowStock ? 'bg-red-500' : 'bg-blue-600'}`} 
                              style={{ width: `${Math.min(100, Math.round((item.stok / ((item.minStok || 1)*5)) * 100))}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      {['OWNER', 'INVENTORY'].includes(userRole || '') && (
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleOpenMutasiModal(item, 'IN')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 text-xs transition-colors"
                            >
                              + IN
                            </button>
                            <button 
                              onClick={() => handleOpenMutasiModal(item, 'OUT')}
                              className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 text-xs transition-colors"
                            >
                              - OUT
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                <p className="text-sm text-gray-500">
                  Menampilkan <span className="font-medium text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredSpareparts.length)}</span> dari <span className="font-medium text-gray-900">{filteredSpareparts.length}</span> data
                </p>
                <div className="flex items-center gap-1 border border-gray-200 rounded-full p-1 shadow-sm bg-white">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    &larr;
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        currentPage === page 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'RIWAYAT' && (
          <div className="overflow-x-auto">
            {/* Same history table but styled better */}
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 font-medium bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Barang</th>
                  <th className="px-6 py-4 text-center">Jenis</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {(mutasiStok || [])
                  .filter(m => !dateFilter || m.tanggal.startsWith(dateFilter))
                  .map((m) => {
                  const sp = (spareparts || []).find(s => s.id === m.sparepartId);
                  const d = new Date(m.tanggal);
                  return (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {d.toLocaleDateString('id-ID')} {d.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{sp?.nama || 'Unknown'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        m.tipe === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {m.tipe}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{m.qty}</td>
                      <td className="px-6 py-4 text-gray-600">{m.keterangan || '-'}</td>
                    </tr>
                  );
                })}
                {(!mutasiStok || mutasiStok.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-8">
                      <EmptyState 
                        icon={<AlertTriangle size={24} />}
                        title="Belum ada riwayat"
                        description="Belum ada aktivitas mutasi stok."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Mutasi Modal */}
      {isMutasiModalOpen && selectedSparepart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              Mutasi {mutasiType === 'IN' ? 'Masuk' : 'Keluar'} - {selectedSparepart.nama}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const qty = Number((e.currentTarget.elements.namedItem('qty') as HTMLInputElement).value);
              const ket = (e.currentTarget.elements.namedItem('ket') as HTMLInputElement).value;
              let hargaBeli = undefined;
              if (mutasiType === 'IN') {
                hargaBeli = Number((e.currentTarget.elements.namedItem('hargaBeli') as HTMLInputElement).value);
              }
              tambahMutasiStok({ sparepartId: selectedSparepart.id, tipe: mutasiType, qty, keterangan: ket, hargaBeli });
              setIsMutasiModalOpen(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Qty)</label>
                  <input name="qty" type="number" min="1" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                {mutasiType === 'IN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli Satuan (Modal Baru)</label>
                    <input name="hargaBeli" type="number" min="0" defaultValue={selectedSparepart.hargaModal} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <p className="text-xs text-gray-500 mt-1">Harga modal rata-rata barang akan dihitung ulang secara otomatis berdasarkan input ini.</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <input name="ket" type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={() => setIsMutasiModalOpen(false)}>Batal</Button>
                <Button type="submit">Simpan Mutasi</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tambah Sparepart Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Tambah Sparepart Baru</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addSparepart({
                id: formData.get('id') as string,
                nama: formData.get('nama') as string,
                kategori: formData.get('kategori') as string,
                merek: formData.get('merek') as string || undefined,
                rak: formData.get('rak') as string || undefined,
                hargaModal: Number(formData.get('hargaModal')),
                harga: Number(formData.get('harga')),
                stok: Number(formData.get('stok')),
                minStok: 5,
                pajak: Number(formData.get('pajak')) || 0
              });
              setIsModalOpen(false);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode SKU</label>
                    <input name="id" type="text" required placeholder="Cth: RAM-8GB-01" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                    <input name="nama" type="text" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <input name="kategori" type="text" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Merek (Opsional)</label>
                    <input name="merek" type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Rak (Opsional)</label>
                    <input name="rak" type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga Modal</label>
                    <input name="hargaModal" type="number" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                    <input name="harga" type="number" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
                    <input name="stok" type="number" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pajak PPN (%)</label>
                    <input name="pajak" type="number" defaultValue="11" min="0" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit">Simpan Sparepart</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
