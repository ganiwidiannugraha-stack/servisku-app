import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { Customer, Order } from '../store';
import { Search, UserPlus, ChevronDown, Eye, ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const Pelanggan: React.FC = () => {
  const navigate = useNavigate();
  const { customers, orders, addCustomer, updateCustomer } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nama: '', noHp: '', email: '', alamat: '' });
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleOpenEdit = (customer: Customer) => {
    setFormData({
      nama: customer.nama,
      noHp: customer.noHp,
      email: customer.email || '',
      alamat: customer.alamat || ''
    });
    setEditId(customer.id);
    setModalMode('edit');
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.noHp) {
      toast.error('Nama dan No. HP wajib diisi');
      return;
    }
    
    if (modalMode === 'edit' && editId) {
      updateCustomer(editId, { ...formData, email: formData.email || undefined });
      toast.success('Pelanggan berhasil diperbarui');
      if (selectedCustomer?.id === editId) {
        setSelectedCustomer({ ...selectedCustomer, ...formData, email: formData.email || undefined });
      }
    } else {
      addCustomer({ ...formData, email: formData.email || undefined });
      toast.success('Pelanggan berhasil ditambahkan');
    }
    
    setIsAddModalOpen(false);
    setFormData({ nama: '', noHp: '', email: '', alamat: '' });
    setEditId(null);
    setModalMode('add');
  };



  const getActiveOrdersCount = (customerId: string) => {
    return orders.filter(o => o.pelangganId === customerId && !['SELESAI', 'DIAMBIL', 'BATAL', 'BATAL_DIAMBIL', 'BATAL_SIAP_DIAMBIL'].includes(o.status)).length;
  };

  const getLatestOrder = (customerId: string): Order | undefined => {
    return orders.filter(o => o.pelangganId === customerId).sort((a, b) => new Date(b.tanggalMasuk).getTime() - new Date(a.tanggalMasuk).getTime())[0];
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.nama.toLowerCase().includes(searchTerm.toLowerCase()) || c.noHp.includes(searchTerm) || (c.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = (() => {
      if (dateFilter === 'ALL') return true;
      const lastService = new Date(c.terakhirServis);
      const now = new Date();
      if (dateFilter === 'THIS_MONTH') {
        return lastService.getMonth() === now.getMonth() && lastService.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'LAST_MONTH') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return lastService.getMonth() === lastMonth.getMonth() && lastService.getFullYear() === lastMonth.getFullYear();
      }
      if (dateFilter === 'THIS_YEAR') {
        return lastService.getFullYear() === now.getFullYear();
      }
      return true;
    })();
    const activeOrders = getActiveOrdersCount(c.id);
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && activeOrders > 0) || (statusFilter === 'INACTIVE' && activeOrders === 0);
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const activeCustomerIds = new Set(orders.filter(o => !['SELESAI', 'DIAMBIL', 'BATAL', 'BATAL_DIAMBIL', 'BATAL_SIAP_DIAMBIL'].includes(o.status)).map(o => o.pelangganId));
  const totalPelanggan = customers.length;
  const pelangganAktif = activeCustomerIds.size;
  const pelangganBaru = 15; // Mock data for demo
  const totalServisAll = customers.reduce((sum, c) => sum + (c.totalServis || 0), 0);
  const rataRataServis = totalPelanggan > 0 ? (totalServisAll / totalPelanggan).toFixed(1) : '0';

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-8 w-full min-h-screen pb-24 bg-[#f8fafc]">
      <Breadcrumb items={selectedCustomer ? [{ label: 'Data Pelanggan' }, { label: 'Detail Pelanggan' }] : [{ label: 'Data Pelanggan' }]} />
      
      {selectedCustomer ? (
        <div className="animate-fade-in mt-6">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Detail Pelanggan</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kiri: Profil Card */}
            <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold">
                  {selectedCustomer.nama.charAt(0).toUpperCase()}
                </div>
                {modalMode === 'edit' && editId === selectedCustomer.id ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setModalMode('add');
                        setEditId(null);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Batal"
                    >
                      <X size={16} />
                    </button>
                    <button 
                      onClick={handleSaveCustomer}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
                    >
                      <Save size={14} /> Simpan
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleOpenEdit(selectedCustomer)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit Pelanggan"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              {/* Form/View Profil */}
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] text-gray-500 mb-1 font-medium">Nama</p>
                  {modalMode === 'edit' && editId === selectedCustomer.id ? (
                    <input 
                      type="text"
                      value={formData.nama} 
                      onChange={(e) => setFormData({...formData, nama: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  ) : (
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
                      {selectedCustomer.nama}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 mb-1 font-medium">No. HP</p>
                  {modalMode === 'edit' && editId === selectedCustomer.id ? (
                    <input 
                      type="text"
                      value={formData.noHp} 
                      onChange={(e) => setFormData({...formData, noHp: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  ) : (
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
                      {selectedCustomer.noHp}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 mb-1 font-medium">Email</p>
                  {modalMode === 'edit' && editId === selectedCustomer.id ? (
                    <input 
                      type="email"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  ) : (
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
                      {selectedCustomer.email || '-'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 mb-1 font-medium">Alamat</p>
                  {modalMode === 'edit' && editId === selectedCustomer.id ? (
                    <input 
                      type="text"
                      value={formData.alamat} 
                      onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  ) : (
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
                      {selectedCustomer.alamat || '-'}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 p-3 bg-gray-50/50 rounded-xl grid grid-cols-2 gap-2 text-center">
                <div className="border-r border-gray-100">
                  <p className="text-base font-bold text-blue-600">{selectedCustomer.totalServis}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Total Order</p>
                </div>
                <div>
                  <p className="text-base font-bold text-green-500">
                    Rp {((orders.filter(o => o.pelangganId === selectedCustomer.id && o.status === 'SELESAI').reduce((sum, o) => sum + (o.estimasiBiaya || 0), 0)) / 1000).toLocaleString('id-ID')}K
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Total Bayar</p>
                </div>
              </div>
            </div>

            {/* Kanan: Riwayat Servis */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Riwayat Servis ({orders.filter(o => o.pelangganId === selectedCustomer.id).length} order)
              </h3>
              
              <div className="divide-y divide-gray-100 border-t border-gray-100">
                {orders.filter(o => o.pelangganId === selectedCustomer.id).sort((a,b) => new Date(b.tanggalMasuk).getTime() - new Date(a.tanggalMasuk).getTime()).map(order => (
                  <div key={order.id} className="py-4 flex justify-between items-center group">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-blue-600">{order.noServis}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'SELESAI' || order.status === 'DIAMBIL' 
                            ? 'bg-green-100 text-green-600'
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          {order.status === 'MASUK' ? 'Baru' : order.status === 'PROSES' ? 'Perbaikan' : order.status === 'SELESAI' ? 'Selesai' : order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {order.merkModel || order.jenisPerangkat} · {new Date(order.tanggalMasuk).toISOString().split('T')[0]}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Rp {(order.estimasiBiaya || 0).toLocaleString('id-ID')}</p>
                        <p className={`text-[10px] mt-0.5 ${order.status === 'DIAMBIL' ? 'text-green-500' : 'text-red-500'}`}>
                          {order.status === 'DIAMBIL' ? 'Sudah Bayar' : 'Belum Bayar'}
                        </p>
                      </div>
                      <button 
                        onClick={() => navigate(`/order/${order.id}`)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors shrink-0"
                        title="Lihat Detail Order"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {orders.filter(o => o.pelangganId === selectedCustomer.id).length === 0 && (
                  <div className="py-8 text-center text-gray-400 text-sm">Belum ada riwayat servis.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Daftar Pelanggan</h1>
              <p className="mt-1 text-sm text-gray-500 font-medium">Kelola data pelanggan dan tingkatkan loyalitas mereka.</p>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-sm text-sm"
            >
              <UserPlus size={18} />
              Tambah Pelanggan Baru
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            {/* Left Stats (2x2) */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm font-bold text-gray-900 mb-1">Total Pelanggan</p>
                <p className="text-4xl font-bold text-gray-900">{totalPelanggan}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm font-bold text-gray-900 mb-1">Pelanggan Aktif</p>
                <p className="text-4xl font-bold text-gray-900">{pelangganAktif}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm font-bold text-gray-900 mb-1">Pelanggan Baru <span className="text-gray-500 font-normal">(Bulan Ini)</span></p>
                <p className="text-4xl font-bold text-emerald-500">+{pelangganBaru}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm font-bold text-gray-900 mb-1">Rata-rata Servis</p>
                <p className="text-4xl font-bold text-gray-900">{rataRataServis}</p>
              </div>
            </div>

            {/* Right Chart */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
              <p className="text-sm font-bold text-gray-900 mb-6">Pertumbuhan Pelanggan <span className="text-gray-500 font-normal">(Tahun Ini)</span></p>
              <div className="flex-1 w-full h-full min-h-[140px] relative mt-2 pl-8 pb-6">
                {/* Y-Axis Labels */}
                <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] font-medium text-gray-400">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>
                
                {/* Modern Minimalist SVG Chart */}
                <svg viewBox="0 0 400 100" className="w-full h-full absolute inset-0 left-8 preserve-3d" style={{ width: 'calc(100% - 2rem)', height: 'calc(100% - 1.5rem)' }} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="modern-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#modern-gradient)"
                    d="M0,100 L0,95 C33,85 66,70 100,60 C133,50 166,60 200,45 C233,30 266,20 300,25 C333,30 366,15 400,5 L400,100 Z"
                  />
                  <path
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M0,95 C33,85 66,70 100,60 C133,50 166,60 200,45 C233,30 266,20 300,25 C333,30 366,15 400,5"
                  />
                  {/* Subtle data points */}
                  {[
                    {cx: 0, cy: 95}, {cx: 40, cy: 82}, {cx: 80, cy: 68}, 
                    {cx: 120, cy: 55}, {cx: 160, cy: 57}, {cx: 200, cy: 45}, 
                    {cx: 240, cy: 28}, {cx: 280, cy: 21}, {cx: 320, cy: 27}, 
                    {cx: 360, cy: 19}, {cx: 400, cy: 5}
                  ].map((pt, i) => (
                    <circle key={i} cx={pt.cx} cy={pt.cy} r="3.5" fill="white" stroke="#3b82f6" strokeWidth="2" className="hover:r-5 hover:fill-blue-100 transition-all cursor-pointer" />
                  ))}
                </svg>

                {/* Minimalist horizontal grid */}
                <div className="absolute inset-0 left-8 bottom-6 flex flex-col justify-between pointer-events-none opacity-50">
                  <div className="border-b border-dashed border-gray-200 w-full h-[1px]"></div>
                  <div className="border-b border-dashed border-gray-200 w-full h-[1px]"></div>
                  <div className="border-b border-dashed border-gray-200 w-full h-[1px]"></div>
                  <div className="border-b border-dashed border-gray-200 w-full h-[1px]"></div>
                  <div className="border-b border-dashed border-gray-200 w-full h-[1px]"></div>
                </div>

                {/* X-Axis Labels (Months) */}
                <div className="absolute left-8 right-0 bottom-0 flex justify-between text-[10px] font-medium text-gray-400 pt-2">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span>
                  <span>Jun</span><span>Jul</span><span>Ags</span><span>Sep</span><span>Okt</span><span>Nov</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Search</h3>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari nama, nomor HP, email, atau ID..."
                className="w-full py-3 pl-12 pr-4 text-sm font-medium border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm placeholder:font-normal placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative flex items-center border border-gray-200 rounded-xl shadow-sm bg-white">
                <select 
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="py-3 pl-4 pr-10 text-sm font-medium text-gray-700 bg-transparent focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="ACTIVE">Pesanan Aktif</option>
                  <option value="INACTIVE">Tidak Ada Pesanan</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 text-gray-500 pointer-events-none" />
              </div>
              <div className="relative flex items-center border border-gray-200 rounded-xl shadow-sm bg-white">
                <select 
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                  className="py-3 pl-4 pr-10 text-sm font-medium text-gray-700 bg-transparent focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="ALL">Semua Waktu</option>
                  <option value="THIS_MONTH">Bulan Ini</option>
                  <option value="LAST_MONTH">Bulan Lalu</option>
                  <option value="THIS_YEAR">Tahun Ini</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Customer Table List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Pelanggan</th>
                    <th className="px-6 py-4 whitespace-nowrap">Kontak</th>
                    <th className="px-6 py-4 whitespace-nowrap text-center">Total Order</th>
                    <th className="px-6 py-4 whitespace-nowrap text-center">Order Aktif</th>
                    <th className="px-6 py-4 whitespace-nowrap">Terakhir Servis</th>
                    <th className="px-6 py-4 whitespace-nowrap text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCustomers.length > 0 ? paginatedCustomers.map((customer) => {
                    const activeOrders = getActiveOrdersCount(customer.id);
                    const latestOrder = getLatestOrder(customer.id);
                    
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                              {customer.nama.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{customer.nama}</p>
                              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{customer.alamat || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{customer.noHp}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{customer.email || '-'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-gray-700">
                            {customer.totalServis}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${activeOrders > 0 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                            {activeOrders} Aktif
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{new Date(customer.terakhirServis).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">{latestOrder ? `${latestOrder.jenisPerangkat} ${latestOrder.merkModel}` : '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => setSelectedCustomer(customer)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors shadow-sm"
                            >
                              <Eye size={14} /> Detail
                            </button>
                            {customer.noHp && (
                              <a
                                href={`https://wa.me/${customer.noHp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-7 h-7 rounded-lg border border-green-200 bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                                title="Hubungi via WhatsApp"
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                        Tidak ada pelanggan yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 mt-6 border border-gray-100 flex items-center justify-between bg-white rounded-2xl shadow-sm">
              <span className="text-sm text-gray-500 font-medium">
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} dari {filteredCustomers.length} data
              </span>
              <div className="flex items-center gap-1 border border-gray-200 rounded-full p-1 shadow-sm bg-white">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p: number) => p - 1)}
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
                  onClick={() => setCurrentPage((p: number) => p + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setModalMode('add');
          setEditId(null);
          setFormData({ nama: '', noHp: '', email: '', alamat: '' });
        }}
        title={modalMode === 'edit' ? "Edit Data Pelanggan" : "Tambah Pelanggan Baru"}
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4 py-2">
          <Input
            label="Nama Lengkap"
            placeholder="Masukkan nama pelanggan"
            required
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          />
          <Input
            label="Nomor WhatsApp"
            placeholder="Contoh: 08123456789"
            required
            type="tel"
            value={formData.noHp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setFormData({ ...formData, noHp: val });
            }}
          />
          <Input
            label="Email"
            placeholder="Contoh: user@email.com (Opsional)"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Alamat (Opsional)</label>
            <textarea
              rows={2}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Masukkan alamat lengkap..."
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button variant="secondary" type="button" onClick={() => {
              setIsAddModalOpen(false);
              setModalMode('add');
              setEditId(null);
              setFormData({ nama: '', noHp: '', email: '', alamat: '' });
            }}>Batal</Button>
            <Button variant="primary" type="submit" leftIcon={modalMode === 'edit' ? <Edit2 size={16} /> : <UserPlus size={16} />}>
              {modalMode === 'edit' ? 'Simpan Perubahan' : 'Simpan Pelanggan'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
