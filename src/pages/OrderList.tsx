import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, Filter, Calendar, ClipboardList, Eye, User, Lock, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';



export const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const { orders, customers, userRole, userId, technicians, updateOrder } = useStore();
  const [activeTab, setActiveTab] = useState<'AKTIF' | 'SELESAI'>('AKTIF');
  const [techFilter, setTechFilter] = useState<'ALL' | 'MINE' | 'UNASSIGNED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const getCustomer = (id: string) => customers.find(c => c.id === id);
  const getTechnician = (id: string) => technicians.find(t => t.id === id);

  const handleAmbilAlih = (orderId: string) => {
    if (userId) {
      updateOrder(orderId, { teknisiId: userId });
      toast.success('Pekerjaan berhasil diambil alih!');
    }
  };

  const filteredOrders = orders.filter(order => {
    // AKTIF: Semua KECUALI DIAMBIL, BATAL, BATAL_SIAP_DIAMBIL, BATAL_DIAMBIL
    if (activeTab === 'AKTIF' && ['DIAMBIL', 'BATAL', 'BATAL_SIAP_DIAMBIL', 'BATAL_DIAMBIL'].includes(order.status)) return false;
    // SELESAI/ARSIP: Hanya DIAMBIL, BATAL, BATAL_SIAP_DIAMBIL, BATAL_DIAMBIL
    if (activeTab === 'SELESAI' && !['DIAMBIL', 'BATAL', 'BATAL_SIAP_DIAMBIL', 'BATAL_DIAMBIL'].includes(order.status)) return false;

    const customer = getCustomer(order.pelangganId);
    const matchesSearch = 
      order.noServis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.nama || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesDate = !dateFilter || order.tanggalMasuk.startsWith(dateFilter);
    
    let matchesTech = true;
    if (userRole === 'TEKNISI' && activeTab === 'AKTIF') {
      if (techFilter === 'MINE') matchesTech = order.teknisiId === userId;
      if (techFilter === 'UNASSIGNED') matchesTech = !order.teknisiId;
    }
    
    return matchesSearch && matchesStatus && matchesDate && matchesTech;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MASUK': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'PROSES':
      case 'DIAGNOSA': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'MENUNGGU_SPAREPART':
      case 'MENUNGGU_KONFIRMASI': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'SELESAI': return 'bg-green-50 text-green-600 border-green-200';
      case 'SIAP_DIAMBIL': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'BATAL': return 'bg-red-50 text-red-600 border-red-200';
      case 'BATAL_SIAP_DIAMBIL': return 'bg-red-50 text-red-600 border-red-200';
      case 'BATAL_DIAMBIL': return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'DIAMBIL': return 'bg-gray-100 text-gray-600 border-gray-300';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'MASUK': return 'Masuk';
      case 'PROSES': return 'Proses';
      case 'DIAGNOSA': return 'Diagnosa';
      case 'MENUNGGU_SPAREPART': return 'Menunggu Sparepart';
      case 'MENUNGGU_KONFIRMASI': return 'Menunggu Konfirmasi';
      case 'SELESAI': return 'Selesai';
      case 'SIAP_DIAMBIL': return 'Siap Diambil (Lunas)';
      case 'BATAL': return 'Batal Servis';
      case 'BATAL_SIAP_DIAMBIL': return 'Batal (Lunas / Siap Diambil)';
      case 'BATAL_DIAMBIL': return 'Batal (Diambil)';
      case 'DIAMBIL': return 'Diambil';
      default: return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  return (
    <div className="p-8 w-full min-h-screen">
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Order Servis' }]} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Order Servis</h1>
          <p className="mt-1 text-gray-500 font-medium">Kelola semua perangkat servis pelanggan.</p>
        </div>
        {userRole === 'ADMIN' && (
          <button 
            onClick={() => navigate('/order/baru')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            + Terima Perangkat
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari no. servis atau nama pelanggan..."
            className="w-full py-2.5 pl-10 pr-4 text-sm font-medium border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm placeholder:font-normal"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex items-center border border-gray-200 rounded-xl shadow-sm bg-white">
            <Filter size={16} className="absolute left-3 text-gray-500" />
            <select
              className="py-2.5 pl-9 pr-8 text-sm font-medium bg-transparent focus:outline-none appearance-none"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">Semua Status</option>
              {activeTab === 'AKTIF' ? (
                <>
                  <option value="MASUK">Masuk</option>
                  <option value="DIAGNOSA">Diagnosa</option>
                  <option value="PROSES">Proses</option>
                  <option value="MENUNGGU_SPAREPART">Menunggu Sparepart</option>
                  <option value="MENUNGGU_KONFIRMASI">Menunggu Konfirmasi</option>
                  <option value="SELESAI">Selesai</option>
                  <option value="SIAP_DIAMBIL">Siap Diambil (Lunas)</option>
                </>
              ) : (
                <>
                  <option value="BATAL">Batal Servis</option>
                  <option value="BATAL_SIAP_DIAMBIL">Batal (Siap Diambil)</option>
                  <option value="DIAMBIL">Selesai (Diambil)</option>
                  <option value="BATAL_DIAMBIL">Batal (Diambil)</option>
                </>
              )}
            </select>
          </div>
          
          <div className="relative hidden md:flex items-center border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
            <Calendar size={16} className="absolute left-3 text-gray-500 pointer-events-none" />
            <input 
              type="date"
              className="py-2.5 pl-9 pr-4 text-sm font-medium bg-transparent focus:outline-none w-full text-gray-600 cursor-pointer"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            className={`px-6 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'AKTIF' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => { setActiveTab('AKTIF'); setStatusFilter('ALL'); setCurrentPage(1); }}
          >
            Servis Aktif
          </button>
          <button
            className={`px-6 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'SELESAI' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => { setActiveTab('SELESAI'); setStatusFilter('ALL'); setCurrentPage(1); }}
          >
            Arsip (Riwayat & Batal)
          </button>
        </div>

        {userRole === 'TEKNISI' && activeTab === 'AKTIF' && (
          <div className="flex gap-2 p-4 bg-slate-50 border-b border-gray-100">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${techFilter === 'ALL' ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => { setTechFilter('ALL'); setCurrentPage(1); }}
            >
              Semua Order Aktif
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${techFilter === 'MINE' ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => { setTechFilter('MINE'); setCurrentPage(1); }}
            >
              <User size={14} /> Tugas Saya
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${techFilter === 'UNASSIGNED' ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => { setTechFilter('UNASSIGNED'); setCurrentPage(1); }}
            >
              <Search size={14} /> Menunggu Teknisi
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">NO. ORDER</th>
                <th className="px-6 py-4 font-semibold">PELANGGAN</th>
                <th className="px-6 py-4 font-semibold">PERANGKAT</th>
                <th className="px-6 py-4 font-semibold text-center">STATUS</th>
                <th className="px-6 py-4 font-semibold text-center">PRIORITAS</th>
                <th className="px-6 py-4 font-semibold">TIMELINE (WAKTU)</th>
                <th className="px-6 py-4 font-semibold text-center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
                  const customer = getCustomer(order.pelangganId);
                  
                  const isTech = userRole === 'TEKNISI';
                  const isMine = isTech && order.teknisiId === userId;
                  const isUnassigned = isTech && !order.teknisiId;
                  const isOthers = isTech && order.teknisiId && order.teknisiId !== userId;
                  
                  const rowClass = isOthers ? 'border-b border-gray-50 opacity-60 bg-gray-50' : 'border-b border-gray-50 hover:bg-gray-50/50 transition-colors';

                  return (
                    <tr key={order.id} className={rowClass}>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-900">{order.noServis}</span>
                          {isTech && isMine && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded w-max"><User size={10} /> TUGAS SAYA</span>}
                          {isTech && isUnassigned && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded w-max">⚠️ MENUNGGU TEKNISI</span>}
                          {isTech && isOthers && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded w-max"><Lock size={10} /> {getTechnician(order.teknisiId || '')?.name?.split(' ')[0] || 'ORANG LAIN'}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900">{customer?.nama || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{customer?.noHp}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900">{order.merkModel || order.jenisPerangkat}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.jenisPerangkat}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center text-sm">
                        {order.prioritas === 'URGENT' ? <span className="text-red-600 font-bold">Mendesak</span> : 
                         order.prioritas === 'HIGH' ? <span className="text-amber-600 font-bold">Tinggi</span> : 
                         <span className="text-blue-600 font-bold">Normal</span>}
                      </td>
                      <td className="px-6 py-5 text-sm">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase w-12">Masuk</span>
                            <span className="text-gray-700 font-medium">
                              {new Date(order.tanggalMasuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-amber-500 uppercase w-12">Target</span>
                            {order.estimasiSelesai ? (
                              <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded text-xs">
                                {new Date(order.estimasiSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-xs">-</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {isUnassigned ? (
                            <button 
                              onClick={() => handleAmbilAlih(order.id)}
                              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors shadow-sm"
                            >
                              <PlusCircle size={14} /> Ambil Alih
                            </button>
                          ) : (
                            <button 
                              onClick={() => navigate(`/order/${order.id}`)}
                              className={`${isOthers ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 text-white'} font-medium py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors shadow-sm`}
                            >
                              <Eye size={14} /> {isOthers ? 'Lihat' : 'Detail'}
                            </button>
                          )}
                          {!isOthers && customer?.noHp && (
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
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12">
                    <EmptyState 
                      icon={<ClipboardList size={32} />}
                      title="Tidak ada order ditemukan"
                      description="Coba ubah filter atau kata kunci pencarian."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl">
            <span className="text-sm text-gray-500 font-medium">
              Halaman {currentPage} dari {totalPages} ({filteredOrders.length} total)
            </span>
            <div className="flex items-center gap-1 border border-gray-200 rounded-full p-1 shadow-sm">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
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
                onClick={() => setCurrentPage(p => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
