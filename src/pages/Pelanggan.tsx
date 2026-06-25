import React, { useState } from 'react';
import { useStore } from '../store';
import { Search, UserPlus, Phone, Trophy, Award, Shield, ChevronDown } from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { generateWALink } from '../utils/whatsappLink';
import toast from 'react-hot-toast';

export const Pelanggan: React.FC = () => {
  const { customers, orders, addCustomer } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nama: '', noHp: '', alamat: '' });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.noHp) {
      toast.error('Nama dan No. HP wajib diisi');
      return;
    }
    
    addCustomer(formData);
    toast.success('Pelanggan berhasil ditambahkan');
    setIsAddModalOpen(false);
    setFormData({ nama: '', noHp: '', alamat: '' });
  };

  const getCustomerTier = (total: number) => {
    if (total >= 10) return { type: 'Gold', color: 'text-yellow-500', icon: Trophy };
    if (total >= 5) return { type: 'Silver', color: 'text-gray-400', icon: Shield };
    return { type: 'Bronze', color: 'text-orange-600', icon: Award };
  };

  const getActiveOrdersCount = (customerId: string) => {
    return orders.filter(o => o.pelangganId === customerId && !['SELESAI', 'DIAMBIL', 'BATAL', 'BATAL_DIAMBIL', 'BATAL_SIAP_DIAMBIL'].includes(o.status)).length;
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.nama.toLowerCase().includes(searchTerm.toLowerCase()) || c.noHp.includes(searchTerm);
    const tier = getCustomerTier(c.totalServis).type;
    const matchesTier = tierFilter === 'ALL' || tier.toUpperCase() === tierFilter;
    const activeOrders = getActiveOrdersCount(c.id);
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && activeOrders > 0) || (statusFilter === 'INACTIVE' && activeOrders === 0);
    
    return matchesSearch && matchesTier && matchesStatus;
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
      <Breadcrumb items={[{ label: 'Data Pelanggan' }]} />
      
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
          <div className="flex-1 w-full h-full min-h-[120px] relative">
            {/* Simple SVG Line Chart Mockup to match the screenshot */}
            <svg viewBox="0 0 400 100" className="w-full h-full absolute inset-0 preserve-3d" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="url(#gradient)"
                points="0,100 0,90 50,70 100,60 150,40 200,30 250,25 300,10 400,0 400,100"
              />
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                points="0,90 50,70 100,60 150,40 200,30 250,25 300,10 400,0"
              />
              <circle cx="0" cy="90" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="50" cy="70" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="100" cy="60" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="150" cy="40" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="200" cy="30" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="250" cy="25" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="300" cy="10" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="400" cy="0" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
            </svg>
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 pb-2">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pl-6 pb-2">
              <div className="border-b border-gray-100 w-full h-[1px]"></div>
              <div className="border-b border-gray-100 w-full h-[1px]"></div>
              <div className="border-b border-gray-100 w-full h-[1px]"></div>
              <div className="border-b border-gray-100 w-full h-[1px]"></div>
              <div className="border-b border-gray-100 w-full h-[1px]"></div>
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
            placeholder="Cari nama, nomor HP, atau ID..."
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
              value={tierFilter}
              onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
              className="py-3 pl-4 pr-10 text-sm font-medium text-gray-700 bg-transparent focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Tier</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
              <option value="BRONZE">Bronze</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {paginatedCustomers.length > 0 ? paginatedCustomers.map((customer) => {
          const tier = getCustomerTier(customer.totalServis);
          const activeOrders = getActiveOrdersCount(customer.id);
          const isGold = tier.type === 'Gold';
          
          return (
            <div 
              key={customer.id} 
              className={`bg-white rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 border-2 transition-all hover:shadow-md ${isGold ? 'border-blue-200/50 hover:border-blue-300' : 'border-gray-100 hover:border-gray-200'} shadow-sm`}
            >
              <div className="flex items-center gap-4 min-w-[240px]">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {customer.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base leading-tight">{customer.nama}</h4>
                  <p className="text-sm text-gray-500">{customer.noHp}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 min-w-[140px]">
                <div className={`p-2 rounded-full ${isGold ? 'bg-yellow-50' : tier.type === 'Silver' ? 'bg-gray-50' : 'bg-orange-50'}`}>
                  <tier.icon size={20} className={tier.color} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">{tier.type}</p>
                  <p className="text-xs text-gray-500">Badge</p>
                </div>
              </div>

              <div className="min-w-[100px]">
                <p className="text-xs text-gray-500 mb-0.5">Total Servis</p>
                <p className="font-bold text-gray-900 text-sm">{customer.totalServis}</p>
              </div>

              <div className="min-w-[120px]">
                <p className="text-xs text-gray-500 mb-0.5">Terakhir Servis</p>
                <p className="font-bold text-gray-900 text-sm">
                  {new Date(customer.terakhirServis).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="min-w-[100px]">
                <p className="text-xs text-gray-500 mb-0.5">Pesanan Aktif</p>
                <p className="font-bold text-gray-900 text-sm">{activeOrders}</p>
              </div>

              <div className="flex-shrink-0">
                <button 
                  onClick={() => window.open(generateWALink(customer.noHp, `Halo ${customer.nama}, `), '_blank')}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-sm text-sm w-full md:w-auto justify-center"
                >
                  <Phone size={16} /> Hubungi
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
            <p className="text-gray-500 font-medium">Tidak ada pelanggan yang cocok dengan pencarian.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 mt-6 border border-gray-100 flex items-center justify-between bg-white rounded-2xl shadow-sm">
          <span className="text-sm text-gray-500 font-medium">
            Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} dari {filteredCustomers.length} data
          </span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 bg-white transition-colors"
            >
              Sebelumnya
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 bg-white transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Pelanggan Baru"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4 py-2">
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
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
            <Button variant="primary" type="submit" leftIcon={<UserPlus size={16} />}>Simpan Pelanggan</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
