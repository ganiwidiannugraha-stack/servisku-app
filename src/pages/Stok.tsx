import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../store';
import type { Sparepart } from '../store';
import { Button } from '../components/ui/Button';
import { Plus, Search, Filter, AlertTriangle, Wallet, Calendar, Trash2, RefreshCw, Check } from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Autocomplete } from '../components/ui/Autocomplete';
import { toast } from 'react-hot-toast';

export const Stok: React.FC = () => {
  const { spareparts, mutasiStok, addSparepart, deleteSparepart, tambahMutasiStok, userRole } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sparepartToDelete, setSparepartToDelete] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const skuInputRef = useRef<HTMLInputElement>(null);
  
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
    
    let matchesStatus = true;
    if (statusFilter === 'LOW_STOCK') {
      matchesStatus = s.stok <= (s.minStok || 0);
    } else if (statusFilter === 'IN_STOCK') {
      matchesStatus = s.stok > (s.minStok || 0);
    }

    return matchesSearch && matchesKategori && matchesStatus;
  });

  const paginatedSpareparts = filteredSpareparts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredSpareparts.length / itemsPerPage);

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, kategoriFilter, statusFilter]);

  const totalNilaiStok = useMemo(() => {
    return (spareparts || []).reduce((sum, sp) => sum + (sp.stok * (sp.hargaModal || 0)), 0);
  }, [spareparts]);

  const itemsToRestock = useMemo(() => {
    return (spareparts || []).filter(sp => sp.stok <= (sp.minStok || 0)).length;
  }, [spareparts]);

  const uniqueCategories = useMemo(() => Array.from(new Set(spareparts?.map(s => s.kategori).filter(Boolean))), [spareparts]);
  const uniqueBrands = useMemo(() => Array.from(new Set(spareparts?.map(s => s.merek).filter(Boolean))), [spareparts]);
  const uniqueRacks = useMemo(() => Array.from(new Set(spareparts?.map(s => s.rak).filter(Boolean))), [spareparts]);

  const handleOpenMutasiModal = (sparepart: Sparepart, tipe: 'IN' | 'OUT') => {
    setSelectedSparepart(sparepart);
    setMutasiType(tipe);
    setIsMutasiModalOpen(true);
  };

  const handleDeleteSparepart = (id: string) => {
    setSparepartToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (sparepartToDelete) {
      try {
        await deleteSparepart(sparepartToDelete);
        toast.success("Sparepart berhasil dihapus.");
      } catch {
        toast.error("Gagal menghapus sparepart. Cek koneksi Anda.");
      }
    }
    setIsDeleteModalOpen(false);
    setSparepartToDelete(null);
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
      {['OWNER', 'INVENTORY'].includes(userRole || '') && (
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
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={activeTab === 'STOK' ? "Cari nama, kategori atau SKU..." : "Cari nama barang..."}
            className="w-full py-2.5 pl-10 pr-4 text-sm font-medium border border-gray-200 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm placeholder:font-normal transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {activeTab === 'STOK' && (
            <>
              <div className="relative flex items-center border border-gray-200 rounded-full shadow-sm bg-white flex-shrink-0">
                <Filter size={16} className="absolute left-3 text-gray-500" />
                <select 
                  value={kategoriFilter}
                  onChange={(e) => setKategoriFilter(e.target.value)}
                  className="py-2.5 pl-9 pr-8 text-sm font-medium bg-transparent focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="ALL">Semua Kategori</option>
                  {Array.from(new Set((spareparts || []).map(s => s.kategori))).filter(Boolean).map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex items-center border border-gray-200 rounded-full shadow-sm bg-white flex-shrink-0">
                <div className={`absolute left-3 w-2 h-2 rounded-full ${statusFilter === 'LOW_STOCK' ? 'bg-red-500' : statusFilter === 'IN_STOCK' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2.5 pl-8 pr-8 text-sm font-medium bg-transparent focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="ALL">Semua Status Stok</option>
                  <option value="IN_STOCK">Stok Aman</option>
                  <option value="LOW_STOCK">Perlu Restok</option>
                </select>
              </div>
            </>
          )}
          
          {activeTab === 'RIWAYAT' && (
            <div className="relative hidden md:flex items-center border border-gray-200 rounded-full shadow-sm bg-white overflow-hidden flex-shrink-0">
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
                            {['OWNER', 'INVENTORY'].includes(userRole || '') && (
                              <button 
                                onClick={() => handleDeleteSparepart(item.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold p-1.5 rounded-lg border border-red-100 transition-colors"
                                title="Hapus Sparepart"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Menampilkan <span className="font-medium text-gray-900">{filteredSpareparts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredSpareparts.length)}</span> dari <span className="font-medium text-gray-900">{filteredSpareparts.length}</span> data
                </span>
                <select 
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5 / halaman</option>
                  <option value={10}>10 / halaman</option>
                  <option value={15}>15 / halaman</option>
                  <option value={20}>20 / halaman</option>
                  <option value={50}>50 / halaman</option>
                </select>
              </div>
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
              <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setIsMutasiModalOpen(false)}>Batal</Button>
                <Button type="submit" leftIcon={<Check size={16} />}>Simpan Mutasi</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tambah Sparepart Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6">
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
              
              toast.success(`${formData.get('nama')} berhasil ditambahkan!`);
              
              const submitType = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value');
              if (submitType === 'saveAndClose') {
                setIsModalOpen(false);
              } else {
                // Simpan & Tambah Lagi: reset sku, nama, stok. Biarkan kategori & merek.
                if (skuInputRef.current) skuInputRef.current.value = 'SKU-' + Math.random().toString(36).substr(2, 6).toUpperCase();
                const namaInput = e.currentTarget.elements.namedItem('nama') as HTMLInputElement;
                if (namaInput) {
                  namaInput.value = '';
                  namaInput.focus();
                }
                const stokInput = e.currentTarget.elements.namedItem('stok') as HTMLInputElement;
                if (stokInput) stokInput.value = '';
              }
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode SKU</label>
                    <div className="flex gap-2">
                      <input ref={skuInputRef} name="id" type="text" required placeholder="Cth: RAM-8GB-01" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm uppercase transition-all" />
                      <button type="button" onClick={() => { if(skuInputRef.current) skuInputRef.current.value = 'SKU-' + Math.random().toString(36).substr(2, 6).toUpperCase(); }} className="px-3 bg-gray-50 hover:bg-blue-50 border border-gray-300 hover:border-blue-300 rounded-lg text-gray-500 hover:text-blue-600 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 group shadow-sm" title="Generate Otomatis">
                        <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                    <input name="nama" type="text" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <Autocomplete name="kategori" required placeholder="Ketik atau pilih kategori..." options={uniqueCategories} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Merek (Opsional)</label>
                    <Autocomplete name="merek" placeholder="Ketik atau pilih..." options={uniqueBrands} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Rak (Opsional)</label>
                    <Autocomplete name="rak" placeholder="Ketik atau pilih..." options={uniqueRacks} />
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
              <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" name="submitType" value="saveAndAdd" variant="secondary" leftIcon={<Plus size={16} />} className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all font-semibold">Simpan & Tambah Lagi</Button>
                <Button type="submit" name="submitType" value="saveAndClose" leftIcon={<Check size={16} />}>Simpan & Tutup</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Hapus Sparepart */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSparepartToDelete(null);
        }}
        title="Hapus Sparepart"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsDeleteModalOpen(false);
              setSparepartToDelete(null);
            }}>
              Batal
            </Button>
            <Button variant="primary" className="bg-red-600 hover:bg-red-700 border-none" onClick={confirmDelete}>
              Ya, Hapus
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-1">
            <Trash2 size={20} />
          </div>
          <div>
            <h4 className="text-gray-900 font-semibold text-base mb-1">Hapus dari Katalog?</h4>
            <p className="text-gray-600 text-sm">
              Apakah Anda yakin ingin menghapus sparepart ini dari katalog? Semua data mutasi untuk barang ini akan ikut terhapus secara permanen.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
